import express from 'express';
import { uploadBackup, parseBackup, getBackupStatus, getAllBackups, deleteBackup } from '../controllers/backupController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/upload', uploadBackup);
router.post('/parse', parseBackup);
router.get('/status/:id', getBackupStatus);
router.get('/', getAllBackups);
router.delete('/:id', deleteBackup);

export default router;