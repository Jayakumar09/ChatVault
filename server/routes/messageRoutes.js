import express from 'express';
import { getAllMessages, searchMessages, toggleStarMessage, getStarredMessages, getMessageById } from '../controllers/messageController.js';

const router = express.Router();

router.get('/', getAllMessages);
router.get('/search', searchMessages);
router.get('/starred', getStarredMessages);
router.get('/:id', getMessageById);
router.patch('/:id/star', toggleStarMessage);

export default router;