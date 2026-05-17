import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Contact from '../models/Contact.js';
import Message from '../models/Message.js';
import MediaFile from '../models/MediaFile.js';

const WHATSAPP_DATE_PATTERNS = [
  /(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4}),?\s*(\d{1,2}:\d{2})(?::\d{2})?\s*(am|pm|AM|PM)?/i,
  /(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})\s+(\d{1,2}:\d{2})\s*(am|pm|AM|PM)?/i,
  /\[(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4}),?\s*(\d{1,2}:\d{2})(?::\d{2})?\s*(am|pm|AM|PM)?\]/i
];

const MESSAGE_PATTERN = /^((?:\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}|\[\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}),?\s*(?:\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm|AM|PM)?)?)\s*[-–]\s*(.+?):\s*(.+)$/i;

let currentUserId = null;
let currentBackupId = null;

const MEDIA_PATTERNS = [
  /<Media omitted>/i,
  /<image omitted>/i,
  /<video omitted>/i,
  /<audio omitted>/i,
  /<document omitted>/i,
  /<sticker omitted>/i
];

const parseDate = (dateStr, timeStr) => {
  try {
    let day, month, year, time;

    const match = dateStr.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);
    if (match) {
      day = parseInt(match[1]);
      month = parseInt(match[2]) - 1;
      year = parseInt(match[3]);
      if (year < 100) year += 2000;
    }

    const timeMatch = (timeStr || '').match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const seconds = timeMatch[3] ? parseInt(timeMatch[3]) : 0;
      const meridiem = timeMatch[4]?.toLowerCase();

      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;

      const date = new Date(year, month, day, hours, minutes, seconds);
      if (!isNaN(date.getTime())) return date;
    }

    return new Date(year, month, day) || new Date();
  } catch (e) {
    return new Date();
  }
};

const detectMessageType = (content) => {
  const lowerContent = content.toLowerCase();

  if (MEDIA_PATTERNS.some(p => p.test(lowerContent))) {
    if (lowerContent.includes('video') || lowerContent.includes('<video')) return 'video';
    if (lowerContent.includes('audio') || lowerContent.includes('<audio')) return 'audio';
    if (lowerContent.includes('document') || lowerContent.includes('<document')) return 'document';
    return 'image';
  }

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const videoExtensions = ['.mp4', '.3gp', '.webm', '.mov'];
  const audioExtensions = ['.mp3', '.m4a', '.wav', '.ogg', '.aac'];
  const docExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];

  for (const ext of imageExtensions) if (content.includes(ext)) return 'image';
  for (const ext of videoExtensions) if (content.includes(ext)) return 'video';
  for (const ext of audioExtensions) if (content.includes(ext)) return 'audio';
  for (const ext of docExtensions) if (content.includes(ext)) return 'document';

  return 'text';
};

const extractMediaType = (filename) => {
  if (!filename) return 'document';
  const ext = path.extname(filename).toLowerCase();
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const videoExts = ['.mp4', '.3gp', '.webm', '.mkv', '.avi', '.mov'];
  const audioExts = ['.mp3', '.m4a', '.wav', '.ogg', '.aac', '.opus'];

  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  return 'document';
};

const getMimeType = (ext) => {
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.bmp': 'image/bmp',
    '.mp4': 'video/mp4',
    '.3gp': 'video/3gpp',
    '.webm': 'video/webm',
    '.mkv': 'video/x-matroska',
    '.mov': 'video/quicktime',
    '.mp3': 'audio/mpeg',
    '.m4a': 'audio/mp4',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.aac': 'audio/aac',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.txt': 'text/plain'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

export const parseWhatsAppChat = async (chatContent, backupDir, backupId, userId, progressCallback) => {
  currentUserId = userId;
  currentBackupId = backupId;

  const lines = chatContent.split(/\r?\n/).filter(line => line.trim());
  const totalLines = lines.length;

  const contactsMap = new Map();
  const messagesToInsert = [];
  let processedLines = 0;
  let currentContact = null;
  let currentMessage = '';
  let currentTimestamp = null;

  const updateProgress = (current, total, phase) => {
    if (progressCallback) {
      progressCallback({ current, total, percentage: Math.round((current / total) * 100), phase });
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    processedLines++;
    if (processedLines % 100 === 0) {
      updateProgress(processedLines, totalLines, 'Parsing messages');
    }

    const match = line.match(MESSAGE_PATTERN);

    if (match) {
      if (currentContact && currentMessage.trim()) {
        const msgContent = currentMessage.trim();
        messagesToInsert.push({
          userId,
          contactId: currentContact._id,
          content: msgContent,
          timestamp: currentTimestamp || new Date(),
          type: detectMessageType(msgContent),
          metadata: {
            backupId,
            importedAt: new Date()
          }
        });
      }

      const [, dateTimeStr, sender, content] = match;
      currentTimestamp = parseDate(dateTimeStr, '');

      const senderName = sender.trim();
      if (!contactsMap.has(senderName)) {
        const existingContact = await Contact.findOne({ userId, name: senderName });
        if (existingContact) {
          contactsMap.set(senderName, existingContact);
        } else {
          const newContact = new Contact({
            userId,
            name: senderName,
            phone: '',
            createdAt: new Date()
          });
          await newContact.save();
          contactsMap.set(senderName, newContact);
        }
      }
      currentContact = contactsMap.get(senderName);
      currentMessage = content;
    } else if (currentContact && line.length > 0) {
      currentMessage += '\n' + line;
    }
  }

  if (currentContact && currentMessage.trim()) {
    messagesToInsert.push({
      userId,
      contactId: currentContact._id,
      content: currentMessage.trim(),
      timestamp: currentTimestamp || new Date(),
      type: detectMessageType(currentMessage.trim()),
      metadata: { backupId, importedAt: new Date() }
    });
  }

  updateProgress(totalLines, totalLines, 'Saving messages to database');

  if (messagesToInsert.length > 0) {
    const batchSize = 500;
    for (let i = 0; i < messagesToInsert.length; i += batchSize) {
      const batch = messagesToInsert.slice(i, i + batchSize);
      await Message.insertMany(batch, { ordered: false });
      updateProgress(totalLines + (i / batchSize), totalLines + 100, 'Saving messages');
    }
  }

  for (const [name, contact] of contactsMap) {
    const messageCount = await Message.countDocuments({ userId, contactId: contact._id });
    const lastMessage = await Message.findOne({ userId, contactId: contact._id }).sort({ timestamp: -1 });
    const mediaCount = await MediaFile.countDocuments({ userId, contactId: contact._id });

    await Contact.findByIdAndUpdate(contact._id, {
      totalMessages: messageCount,
      totalMedia: mediaCount,
      lastMessageAt: lastMessage?.timestamp || null
    });
  }

  return {
    totalContacts: contactsMap.size,
    totalMessages: messagesToInsert.length,
    contacts: Array.from(contactsMap.values()).map(c => ({
      _id: c._id,
      name: c.name,
      totalMessages: c.totalMessages,
      lastMessageAt: c.lastMessageAt
    }))
  };
};

export const extractMediaFiles = async (backupDir, backupId, userId, progressCallback) => {
  const mediaFiles = [];
  const supportedExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp',
    '.mp4', '.3gp', '.webm', '.mkv', '.mov',
    '.mp3', '.m4a', '.wav', '.ogg', '.aac', '.opus',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'
  ];

  const uploadDir = path.join(process.cwd(), 'uploads', userId.toString());
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let fileCount = 0;

  const scanDir = async (dir, relativePath = '') => {
    try {
      if (!fs.existsSync(dir)) return;

      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          await scanDir(fullPath, path.join(relativePath, item));
        } else {
          const ext = path.extname(item).toLowerCase();
          if (supportedExtensions.includes(ext)) {
            fileCount++;

            console.log(`   📄 Found media: ${item} (${ext})`);

            if (fileCount % 10 === 0 && progressCallback) {
              progressCallback({ phase: 'Extracting media', count: fileCount });
            }

            try {
              const type = extractMediaType(item);
              const filename = `${uuidv4()}${ext}`;
              const destPath = path.join(uploadDir, filename);

              fs.copyFileSync(fullPath, destPath);
              console.log(`   💾 Copied to: ${destPath}`);

              const mimetype = getMimeType(ext);
              const size = stat.size;

              const mediaFile = new MediaFile({
                userId,
                filename,
                originalName: item,
                mimetype,
                size,
                path: `${userId}/${filename}`,
                type,
                metadata: {
                  backupId,
                  importedAt: new Date()
                }
              });
              
              await mediaFile.save();
              console.log(`   ✅ Saved to MongoDB: ${mediaFile._id}`);
              mediaFiles.push(mediaFile);
            } catch (mediaError) {
              console.error(`   ❌ Error saving media ${item}:`, mediaError.message);
            }
          }
        }
      }
    } catch (e) {
      console.error(`Error scanning directory ${dir}:`, e.message);
    }
  };

  await scanDir(backupDir);

  return mediaFiles;
};

export const findChatFile = (backupDir) => {
  const chatFileNames = [
    '_chat.txt',
    'chat.txt',
    'WhatsApp Chat - ',
    'WhatsApp Chat.txt',
    'messages.txt'
  ];

  const scanForChatFile = (dir, depth = 0) => {
    if (depth > 3) return null;

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          const result = scanForChatFile(fullPath, depth + 1);
          if (result) return result;
        } else if (item.endsWith('.txt')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (content.includes('Messages') || content.includes('Chat history') ||
            content.includes('WhatsApp') || content.includes('- ')) {
            return fullPath;
          }
        }
      }
    } catch (e) {
      console.error(`Error scanning ${dir}:`, e.message);
    }
    return null;
  };

  return scanForChatFile(backupDir);
};

export const cleanupBackup = (backupDir) => {
  try {
    if (fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true, force: true });
    }
  } catch (e) {
    console.error('Cleanup error:', e.message);
  }
};