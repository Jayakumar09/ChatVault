import express from 'express';
import { getDashboardStats, getTimelineData, getActivityByHour } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/dashboard', getDashboardStats);
router.get('/timeline', getTimelineData);
router.get('/activity', getActivityByHour);

export default router;