import DailyLog from '../models/DailyLog.js';

export const getDailyLog = async (req, res) => {
  try {
    const { date } = req.query;
    const logDate = date ? new Date(date).setHours(0, 0, 0, 0) : new Date().setHours(0, 0, 0, 0);

    let log = await DailyLog.findOne({
      userId: req.user.id,
      date: new Date(logDate)
    });

    if (!log) {
      log = await DailyLog.create({
        userId: req.user.id,
        date: new Date(logDate)
      });
    }

    res.status(200).json({ success: true, log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateWakeUpTime = async (req, res) => {
  try {
    const { actualTime, date } = req.body;
    const logDate = date ? new Date(date).setHours(0, 0, 0, 0) : new Date().setHours(0, 0, 0, 0);

    let log = await DailyLog.findOne({
      userId: req.user.id,
      date: new Date(logDate)
    });

    if (!log) {
      log = await DailyLog.create({
        userId: req.user.id,
        date: new Date(logDate)
      });
    }

    // Parse time
    const [hours, minutes] = actualTime.split(':').map(Number);
    const plannedTime = new Date(logDate);
    plannedTime.setHours(6, 0, 0, 0);

    const actualTimeDate = new Date(logDate);
    actualTimeDate.setHours(hours, minutes, 0, 0);

    const lateMinutes = Math.floor((actualTimeDate - plannedTime) / 60000);

    log.wakeUpTime.actualTime = actualTime;
    log.wakeUpTime.lateMinutes = lateMinutes;
    log.wakeUpTime.status = lateMinutes <= 0 ? 'on-time' : 'late';

    await log.save();

    res.status(200).json({ success: true, log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addWater = async (req, res) => {
  try {
    const { amount, date } = req.body;
    const logDate = date ? new Date(date).setHours(0, 0, 0, 0) : new Date().setHours(0, 0, 0, 0);

    let log = await DailyLog.findOne({
      userId: req.user.id,
      date: new Date(logDate)
    });

    if (!log) {
      log = await DailyLog.create({
        userId: req.user.id,
        date: new Date(logDate)
      });
    }

    log.waterIntake.actual += amount;
    log.waterIntake.count += 1;

    await log.save();

    res.status(200).json({ success: true, log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStudyHours = async (req, res) => {
  try {
    const { session, hours, date } = req.body;
    const logDate = date ? new Date(date).setHours(0, 0, 0, 0) : new Date().setHours(0, 0, 0, 0);

    let log = await DailyLog.findOne({
      userId: req.user.id,
      date: new Date(logDate)
    });

    if (!log) {
      log = await DailyLog.create({
        userId: req.user.id,
        date: new Date(logDate)
      });
    }

    if (session === 1) {
      log.studyHours.session1.actual = hours;
      log.studyHours.session1.completed = hours >= 4;
    } else if (session === 2) {
      log.studyHours.session2.actual = hours;
      log.studyHours.session2.completed = hours >= 4;
    }

    log.studyHours.totalHours = log.studyHours.session1.actual + log.studyHours.session2.actual;

    await log.save();

    res.status(200).json({ success: true, log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const { habit, value, date } = req.body;
    const logDate = date ? new Date(date).setHours(0, 0, 0, 0) : new Date().setHours(0, 0, 0, 0);

    let log = await DailyLog.findOne({
      userId: req.user.id,
      date: new Date(logDate)
    });

    if (!log) {
      log = await DailyLog.create({
        userId: req.user.id,
        date: new Date(logDate)
      });
    }

    if (habit === 'noMasturbation') {
      log.habits.noMasturbation = value;
    }

    await log.save();

    res.status(200).json({ success: true, log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);

    const logs = await DailyLog.find({
      userId: req.user.id,
      date: { $gte: new Date(start), $lte: new Date(end) }
    }).sort({ date: 1 });

    const analytics = {
      totalDays: logs.length,
      wakeUpOnTime: logs.filter(log => log.wakeUpTime.status === 'on-time').length,
      studyCompleted: logs.filter(log => log.studyHours.totalHours >= 8).length,
      waterGoalMet: logs.filter(log => log.waterIntake.actual >= log.waterIntake.goal).length,
      habitStreak: 0,
      averageStudyHours: logs.reduce((sum, log) => sum + log.studyHours.totalHours, 0) / logs.length || 0,
      averageWaterIntake: logs.reduce((sum, log) => sum + log.waterIntake.actual, 0) / logs.length || 0,
      logs: logs
    };

    // Calculate streak
    let streak = 0;
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i].habits.noMasturbation) {
        streak++;
      } else {
        break;
      }
    }
    analytics.habitStreak = streak;

    res.status(200).json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDailyLog = async (req, res) => {
  try {
    const { date, ...updates } = req.body;
    const logDate = date ? new Date(date).setHours(0, 0, 0, 0) : new Date().setHours(0, 0, 0, 0);

    let log = await DailyLog.findOne({
      userId: req.user.id,
      date: new Date(logDate)
    });

    if (!log) {
      log = await DailyLog.create({
        userId: req.user.id,
        date: new Date(logDate),
        ...updates
      });
    } else {
      Object.assign(log, updates);
      await log.save();
    }

    res.status(200).json({ success: true, log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
