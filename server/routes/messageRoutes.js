import express from 'express';
import { getAllMessages, searchMessages, toggleStarMessage, getStarredMessages, getMessageById } from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAllMessages);
router.get('/search', searchMessages);
router.get('/starred', getStarredMessages);
router.get('/:id', getMessageById);
router.patch('/:id/star', toggleStarMessage);

export default router;