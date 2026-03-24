import express from 'express';
import {
  getDailyLog,
  updateWakeUpTime,
  addWater,
  updateStudyHours,
  updateHabit,
  getAnalytics,
  updateDailyLog
} from '../controllers/dailyLogController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/log', getDailyLog);
router.put('/log', updateDailyLog);
router.put('/wake-up', updateWakeUpTime);
router.post('/water', addWater);
router.put('/study', updateStudyHours);
router.put('/habit', updateHabit);
router.get('/analytics', getAnalytics);

export default router;
