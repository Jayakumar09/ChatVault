import multer from 'multer';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { parseWhatsAppChat, extractMediaFiles, findChatFile, cleanupBackup } from '../services/parserService.js';
import ChatBackup from '../models/ChatBackup.js';
import Contact from '../models/Contact.js';
import Message from '../models/Message.js';
import MediaFile from '../models/MediaFile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_FILE_SIZE = 500 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.userId?.toString() || 'public';
    const uploadDir = path.join(__dirname, '../backups', userId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/zip-compressed'
    ];

    const allowedExts = ['.zip'];

    const hasValidMime = allowedMimes.includes(file.mimetype);
    const hasValidExt = allowedExts.some(ext => file.originalname.toLowerCase().endsWith(ext));

    if (hasValidMime || hasValidExt) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed. Please upload a WhatsApp export ZIP file.'));
    }
  }
});

export const uploadBackup = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileSizeMB = (req.file.size / (1024 * 1024)).toFixed(2);
    console.log(`📁 Uploaded: ${req.file.originalname} (${fileSizeMB} MB)`);

    const existingBackup = await ChatBackup.findOne({
      userId: req.userId,
      originalName: req.file.originalname,
      status: 'completed'
    });

    if (existingBackup) {
      console.log(`⚠️ Duplicate import detected: ${req.file.originalname}`);
      const userId = req.userId?.toString() || 'public';
      fs.unlinkSync(path.join(__dirname, '../backups', userId, req.file.filename));
      return res.status(409).json({
        error: 'This backup has already been imported',
        existing: {
          id: existingBackup._id,
          importedAt: existingBackup.processedAt,
          totalContacts: existingBackup.totalContacts,
          totalMessages: existingBackup.totalMessages
        }
      });
    }

    const backup = new ChatBackup({
      userId: req.userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      status: 'uploaded'
    });
    await backup.save();
    await backup.save();

    console.log(`✅ Backup created: ${backup._id}`);

    res.json({
      success: true,
      backup: {
        _id: backup._id,
        originalName: backup.originalName,
        fileSize: backup.fileSize,
        status: backup.status,
        createdAt: backup.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const parseBackup = async (req, res) => {
  let backup = null;
  let extractDir = null;

  try {
    const { backupId } = req.body;

    if (!backupId) {
      return res.status(400).json({ error: 'Backup ID is required' });
    }

    backup = await ChatBackup.findById(backupId);
    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    if (backup.status === 'completed') {
      return res.status(400).json({
        error: 'This backup has already been processed',
        result: {
          totalContacts: backup.totalContacts,
          totalMessages: backup.totalMessages,
          totalMedia: backup.totalMedia
        }
      });
    }

    backup.status = 'parsing';
    backup.progress = 0;
    backup.currentPhase = 'Extracting ZIP file...';
    await backup.save();

    console.log(`\n📦 Processing backup: ${backup.originalName}`);
    console.log(`   ID: ${backupId}`);

    const userIdDir = req.userId?.toString() || 'public';
    const zipPath = path.join(__dirname, '../backups', userIdDir, backup.filename);
    extractDir = path.join(__dirname, '../backups', userIdDir, backupId);

    if (fs.existsSync(extractDir)) {
      fs.rmSync(extractDir, { recursive: true, force: true });
    }
    fs.mkdirSync(extractDir, { recursive: true });

    console.log('   📂 Extracting ZIP...');
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractDir, true);

    backup.progress = 10;
    backup.currentPhase = 'Finding chat file...';
    await backup.save();

    console.log('   🔍 Searching for chat file...');
    let chatFilePath = findChatFile(extractDir);

    if (!chatFilePath) {
      chatFilePath = path.join(extractDir, '_chat.txt');
      if (!fs.existsSync(chatFilePath)) {
        chatFilePath = path.join(extractDir, 'chat.txt');
      }
    }

    if (!chatFilePath || !fs.existsSync(chatFilePath)) {
      throw new Error('No WhatsApp chat file (.txt) found in the ZIP. Make sure you exported the chat with media.');
    }

    console.log(`   📄 Found: ${path.basename(chatFilePath)}`);

    backup.progress = 20;
    backup.currentPhase = 'Parsing messages...';
    await backup.save();

    const chatContent = fs.readFileSync(chatFilePath, 'utf-8');
    console.log(`   📝 Parsing ${chatContent.split('\n').length} lines...`);

    const parseResult = await parseWhatsAppChat(chatContent, extractDir, backupId, req.userId, (progress) => {
      if (backup) {
        const mappedProgress = 20 + Math.round(progress.percentage * 0.5);
        backup.progress = Math.min(mappedProgress, 70);
        backup.currentPhase = progress.phase;
        backup.save().catch(() => {});
      }
    });

    console.log(`   ✅ Parsed ${parseResult.totalMessages} messages from ${parseResult.totalContacts} contacts`);

    backup.progress = 75;
    backup.currentPhase = 'Extracting media files...';
    await backup.save();

    console.log('   🎬 Extracting media...');
    const mediaFiles = await extractMediaFiles(extractDir, backupId, req.userId, (progress) => {
      if (backup) {
        backup.progress = 75 + Math.round(progress.count * 0.2);
        backup.currentPhase = `Processing media (${progress.count} files)...`;
        backup.save().catch(() => {});
      }
    });

    console.log(`   📸 Extracted ${mediaFiles.length} media files`);

    backup.status = 'completed';
    backup.progress = 100;
    backup.currentPhase = 'Import complete!';
    backup.totalContacts = parseResult.totalContacts;
    backup.totalMessages = parseResult.totalMessages;
    backup.totalMedia = mediaFiles.length;
    backup.processedAt = new Date();
    await backup.save();

    console.log(`\n✅ Import complete!`);
    console.log(`   Contacts: ${parseResult.totalContacts}`);
    console.log(`   Messages: ${parseResult.totalMessages}`);
    console.log(`   Media: ${mediaFiles.length}\n`);

    res.json({
      success: true,
      backup: {
        _id: backup._id,
        originalName: backup.originalName,
        status: backup.status,
        totalContacts: backup.totalContacts,
        totalMessages: backup.totalMessages,
        totalMedia: backup.totalMedia,
        processedAt: backup.processedAt
      },
      result: {
        ...parseResult,
        totalMedia: mediaFiles.length
      }
    });

    try {
      cleanupBackup(extractDir);
    } catch (e) {
      console.log('   Note: Could not clean up temp files');
    }

  } catch (error) {
    console.error('❌ Parse error:', error.message);

    if (backup) {
      backup.status = 'failed';
      backup.error = error.message;
      backup.progress = 0;
      await backup.save();
    }

    if (extractDir && fs.existsSync(extractDir)) {
      try {
        cleanupBackup(extractDir);
      } catch (e) {}
    }

    res.status(500).json({ error: error.message });
  }
};

export const getBackupStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Backup ID is required' });
    }

    const backup = await ChatBackup.findOne({ _id: id, userId: req.userId });
    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    res.json({
      backup: {
        _id: backup._id,
        originalName: backup.originalName,
        fileSize: backup.fileSize,
        status: backup.status,
        progress: backup.progress || 0,
        currentPhase: backup.currentPhase || '',
        totalContacts: backup.totalContacts,
        totalMessages: backup.totalMessages,
        totalMedia: backup.totalMedia,
        error: backup.error,
        createdAt: backup.createdAt,
        processedAt: backup.processedAt
      }
    });
  } catch (error) {
    console.error('Status error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getAllBackups = async (req, res) => {
  try {
    const backups = await ChatBackup.find({ userId: req.userId })
      .select('-error')
      .sort({ createdAt: -1 });

    res.json({
      backups: backups.map(b => ({
        _id: b._id,
        originalName: b.originalName,
        fileSize: b.fileSize,
        status: b.status,
        totalContacts: b.totalContacts,
        totalMessages: b.totalMessages,
        totalMedia: b.totalMedia,
        createdAt: b.createdAt,
        processedAt: b.processedAt
      }))
    });
  } catch (error) {
    console.error('List backups error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteBackup = async (req, res) => {
  try {
    const { id } = req.params;

    const backup = await ChatBackup.findOne({ _id: id, userId: req.userId });
    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    const userId = req.userId?.toString() || 'public';
    const zipPath = path.join(__dirname, '../backups', userId, backup.filename);
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }

    const messages = await Message.find({ 'metadata.backupId': id });
    const contactIds = [...new Set(messages.map(m => m.contactId))];

    await Message.deleteMany({ 'metadata.backupId': id });
    await MediaFile.deleteMany({ 'metadata.backupId': id });
    await Contact.deleteMany({
      _id: { $in: contactIds },
      totalMessages: 0
    });

    for (const contactId of contactIds) {
      const msgCount = await Message.countDocuments({ contactId });
      const mediaCount = await MediaFile.countDocuments({ contactId });
      await Contact.findByIdAndUpdate(contactId, {
        totalMessages: msgCount,
        totalMedia: mediaCount
      });
    }

    await ChatBackup.findByIdAndDelete(id);

    console.log(`🗑️ Deleted backup: ${backup.originalName}`);

    res.json({ success: true, message: 'Backup deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const uploadMiddleware = upload.single('backup');