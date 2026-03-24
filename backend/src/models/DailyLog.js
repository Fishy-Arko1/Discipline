import mongoose from 'mongoose';

const dailyLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: () => new Date().setHours(0, 0, 0, 0)
  },
  wakeUpTime: {
    plannedTime: {
      type: String,
      default: '06:00'
    },
    actualTime: String,
    status: {
      type: String,
      enum: ['not-marked', 'on-time', 'late'],
      default: 'not-marked'
    },
    lateMinutes: Number
  },
  studyHours: {
    session1: {
      planned: {
        type: Number,
        default: 4
      },
      actual: {
        type: Number,
        default: 0
      },
      completed: {
        type: Boolean,
        default: false
      }
    },
    session2: {
      planned: {
        type: Number,
        default: 4
      },
      actual: {
        type: Number,
        default: 0
      },
      completed: {
        type: Boolean,
        default: false
      }
    },
    totalHours: {
      type: Number,
      default: 0
    }
  },
  waterIntake: {
    goal: {
      type: Number,
      default: 6000 // in ml
    },
    actual: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  habits: {
    noMasturbation: {
      type: Boolean,
      default: false
    }
  },
  customGoals: [{
    goalId: mongoose.Schema.Types.ObjectId,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for quick lookup by userId and date
dailyLogSchema.index({ userId: 1, date: 1 });

export default mongoose.model('DailyLog', dailyLogSchema);
