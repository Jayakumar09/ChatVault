import express from 'express';
import { getAllMedia, getMediaByType, getMediaById, downloadMedia, getMediaStats } from '../controllers/mediaController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAllMedia);
router.get('/types/:type', getMediaByType);
router.get('/stats', getMediaStats);
router.get('/:id', getMediaById);
router.get('/:id/download', downloadMedia);

export default router;