import express from 'express';
import { getDashboardStats } from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard', getDashboardStats);

export default router;