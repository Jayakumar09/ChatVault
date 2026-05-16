import express from 'express';
import { uploadBackup, parseBackup, getBackupStatus, getAllBackups, uploadMiddleware } from '../controllers/backupController.js';

const router = express.Router();

router.post('/upload', uploadMiddleware, uploadBackup);
router.post('/parse', parseBackup);
router.get('/status/:id', getBackupStatus);
router.get('/all', getAllBackups);

export default router;