import multer from 'multer';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { parseWhatsAppChat, extractMediaFiles } from '../services/parserService.js';
import ChatBackup from '../models/ChatBackup.js';
import Contact from '../models/Contact.js';
import Message from '../models/Message.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../backups');
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
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  }
});

export const uploadBackup = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const backup = new ChatBackup({
      filename: req.file.filename,
      originalName: req.file.originalname,
      status: 'uploaded'
    });
    await backup.save();

    res.json({ success: true, backup });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const parseBackup = async (req, res) => {
  try {
    const { backupId } = req.body;

    const backup = await ChatBackup.findById(backupId);
    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    backup.status = 'parsing';
    await backup.save();

    const zipPath = path.join(__dirname, '../backups', backup.filename);
    const extractDir = path.join(__dirname, '../backups', backupId);

    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
    }

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractDir, true);

    const entries = zip.getEntries();
    let chatFilePath = null;

    for (const entry of entries) {
      if (entry.entryName.endsWith('.txt') && !entry.isDirectory) {
        chatFilePath = path.join(extractDir, entry.entryName);
        break;
      }
    }

    if (!chatFilePath) {
      backup.status = 'failed';
      backup.error = 'No chat file found in backup';
      await backup.save();
      return res.status(400).json({ error: 'No chat file found in backup' });
    }

    const chatContent = fs.readFileSync(chatFilePath, 'utf-8');
    const parseResult = await parseWhatsAppChat(chatContent, extractDir, backupId);

    backup.status = 'completed';
    backup.totalContacts = parseResult.totalContacts;
    backup.totalMessages = parseResult.totalMessages;
    backup.totalMedia = parseResult.totalMedia;
    backup.processedAt = new Date();
    await backup.save();

    res.json({ success: true, backup, result: parseResult });
  } catch (error) {
    console.error('Parse error:', error);
    if (backup) {
      backup.status = 'failed';
      backup.error = error.message;
      await backup.save();
    }
    res.status(500).json({ error: error.message });
  }
};

export const getBackupStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const backup = await ChatBackup.findById(id);
    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }
    res.json({ backup });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllBackups = async (req, res) => {
  try {
    const backups = await ChatBackup.find().sort({ createdAt: -1 });
    res.json({ backups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadMiddleware = upload.single('backup');