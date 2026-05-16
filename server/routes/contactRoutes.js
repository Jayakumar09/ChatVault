import express from 'express';
import { getAllContacts, getContactById, getContactMessages, getContactMedia, searchContacts } from '../controllers/contactController.js';

const router = express.Router();

router.get('/', getAllContacts);
router.get('/search', searchContacts);
router.get('/:id', getContactById);
router.get('/:id/messages', getContactMessages);
router.get('/:id/media', getContactMedia);

export default router;