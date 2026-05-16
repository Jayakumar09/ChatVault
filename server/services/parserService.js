import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Contact from '../models/Contact.js';
import Message from '../models/Message.js';
import MediaFile from '../models/MediaFile.js';

const MESSAGE_REGEX = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}),?\s*(\d{1,2}:\d{2}\s*(?:am|pm|AM|PM)?)\s*[-–]\s*(.+?):\s*(.+)/i;
const MULTILINE_REGEX = /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}),?\s*(\d{1,2}:\d{2}\s*(?:am|pm|AM|PM)?)/i;

const parseDate = (dateStr, timeStr) => {
  try {
    const currentYear = new Date().getFullYear();
    let datePart = dateStr.trim();
    const timePart = timeStr.trim();

    if (datePart.includes('/')) {
      const parts = datePart.split('/');
      if (parts[2].length === 2) {
        parts[2] = (parseInt(parts[2]) > 50 ? '19' : '20') + parts[2];
      }
      datePart = parts.join('/');
    }

    let dateTimeStr = `${datePart}, ${timePart}`;
    const parsed = new Date(dateTimeStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    return new Date();
  } catch (e) {
    return new Date();
  }
};

const extractMediaType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const videoExts = ['.mp4', '.3gp', '.webm', '.mkv', '.avi'];
  const audioExts = ['.mp3', '.m4a', '.wav', '.ogg', '.aac'];

  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  return 'document';
};

export const parseWhatsAppChat = async (chatContent, backupDir, backupId) => {
  const lines = chatContent.split('\n');
  const contacts = new Map();
  const messages = [];
  let currentContact = null;
  let currentMessage = '';
  let currentTimestamp = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const match = line.match(MESSAGE_REGEX);

    if (match) {
      if (currentContact && currentMessage) {
        messages.push({
          contactId: currentContact._id,
          content: currentMessage.trim(),
          timestamp: currentTimestamp,
          type: 'text'
        });
      }

      const [, dateStr, timeStr, sender, content] = match;
      currentTimestamp = parseDate(dateStr, timeStr);
      currentMessage = content;

      if (!contacts.has(sender)) {
        const contact = await Contact.findOne({ name: sender });
        if (contact) {
          contacts.set(sender, contact);
        } else {
          const newContact = new Contact({
            name: sender,
            createdAt: new Date()
          });
          await newContact.save();
          contacts.set(sender, newContact);
        }
      }
      currentContact = contacts.get(sender);
    } else if (currentContact && line.length > 0) {
      currentMessage += '\n' + line;
    }
  }

  if (currentContact && currentMessage) {
    messages.push({
      contactId: currentContact._id,
      content: currentMessage.trim(),
      timestamp: currentTimestamp,
      type: 'text'
    });
  }

  const insertedMessages = await Message.insertMany(messages);

  for (const [name, contact] of contacts) {
    const contactMessages = await Message.countDocuments({ contactId: contact._id });
    await Contact.findByIdAndUpdate(contact._id, {
      totalMessages: contactMessages,
      lastMessageAt: await Message.findOne({ contactId: contact._id }).sort({ timestamp: -1 }).then(m => m?.timestamp)
    });
  }

  return {
    totalContacts: contacts.size,
    totalMessages: messages.length,
    totalMedia: 0
  };
};

export const extractMediaFiles = async (backupDir) => {
  const mediaFiles = [];
  const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.3gp', '.webm', '.mp3', '.m4a', '.wav', '.pdf', '.doc', '.docx', '.xls', '.xlsx'];

  const scanDir = async (dir, contactName) => {
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          await scanDir(fullPath, item);
        } else {
          const ext = path.extname(item).toLowerCase();
          if (supportedExtensions.includes(ext)) {
            const type = extractMediaType(item);
            const filename = `${uuidv4()}${ext}`;
            const destPath = path.join('server/uploads', filename);

            fs.copyFileSync(fullPath, destPath);

            const mediaFile = new MediaFile({
              filename,
              originalName: item,
              mimetype: getMimeType(ext),
              size: stat.size,
              path: destPath,
              type,
              createdAt: new Date()
            });
            await mediaFile.save();
            mediaFiles.push(mediaFile);
          }
        }
      }
    } catch (e) {
      console.error('Error scanning directory:', e.message);
    }
  };

  await scanDir(backupDir, 'unknown');
  return mediaFiles;
};

const getMimeType = (ext) => {
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.3gp': 'video/3gpp',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.m4a': 'audio/mp4',
    '.wav': 'audio/wav',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};