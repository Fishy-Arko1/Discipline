export type GoalType = 'Lose Fat' | 'Gain Muscle' | 'Maintain';

export type AppTab = 'home' | 'progress' | 'leaderboard' | 'companion' | 'scan' | 'profile';

export interface DailyTargets {
  wakeUpGoal: string;
  workoutMinutes: number;
  studyHours: number;
  waterLiters: number;
  calories: number;
  workoutPlan: WorkoutPlan;
}

export interface WorkoutPlan {
  title: string;
  summary: string;
  dailyChecklist: WorkoutTask[];
  recoveryTip: string;
}

export interface WorkoutTask {
  id: string;
  label: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  goal: GoalType;
  dailyAvailableHours: number;
  dailyTargets: DailyTargets;
}

export interface UserSession {
  userId: string;
  identifier: string;
  verifiedAt: string;
  provider: 'simulated-otp' | 'firebase-auth' | 'email-smtp' | 'email-otp';
}

export interface DailyLog {
  date: string;
  wakeUpTime?: string;
  studyMinutes: number;
  waterIntakeMl: number;
  caloriesBurned: number;
  caloriesConsumed: number;
  foodEntries: FoodEntry[];
  completedWorkoutTasks: string[];
}

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  source: 'spoonacular' | 'mock' | 'groq';
  createdAt: string;
  imageName?: string;
}

export interface StreakRecord {
  date: string;
  streak: number;
}

export interface NotificationItem {
  id: string;
  label: string;
  time: string;
  enabled: boolean;
}

export interface LeaderboardEntry {
  id: string;
  userId?: string;
  name: string;
  points: number;
  identifier?: string;
  lastSeen?: string;
  isOnline?: boolean;
}

export interface AppState {
  session: UserSession | null;
  profile: UserProfile | null;
  logs: DailyLog[];
  streakHistory: StreakRecord[];
  notifications: NotificationItem[];
  leaderboard: LeaderboardEntry[];
  darkMode: boolean;
}
