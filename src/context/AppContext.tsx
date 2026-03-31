import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { todayKey } from '../lib/date';
import { generatePlan } from '../lib/plan';
import {
  clearGlobalState,
  clearUserState,
  loadGlobalState,
  loadUserState,
  saveGlobalState,
  saveUserState,
} from '../lib/storage';
import { computeUserScore } from '../lib/score';
import { randomId } from '../lib/utils';
import { defaultNotifications } from '../services/notifications';
import {
  clearCloudData,
  hydrateRemoteState,
  subscribeToLeaderboard,
  syncDailyLog,
  syncLeaderboardPresence,
  syncProfile,
} from '../services/persistence';
import {
  AppState,
  DailyLog,
  FoodEntry,
  LeaderboardEntry,
  NotificationItem,
  UserProfile,
  UserSession,
} from '../types';

interface AppContextValue extends AppState {
  isReady: boolean;
  currentLog: DailyLog;
  login(session: UserSession): void;
  logout(): void;
  completeOnboarding(payload: Omit<UserProfile, 'userId' | 'dailyTargets'>): Promise<void>;
  updateProfile(profile: Partial<UserProfile>): Promise<void>;
  markWakeUp(timeValue?: string): Promise<void>;
  addStudyMinutes(minutes: number): Promise<void>;
  addWater(amount: number): Promise<void>;
  addCaloriesBurned(value: number): Promise<void>;
  addFoodEntry(entry: FoodEntry): Promise<void>;
  removeFoodEntry(entryId: string): Promise<void>;
  toggleWorkoutTask(taskId: string): Promise<void>;
  addLeaderboardEntry(name: string, points: number): void;
  toggleDarkMode(): void;
  toggleNotification(id: string): void;
  updateNotificationTime(id: string, time: string): void;
  resetAllData(): Promise<void>;
}

const defaultLog = (): DailyLog => ({
  date: todayKey(),
  studyMinutes: 0,
  waterIntakeMl: 0,
  caloriesBurned: 0,
  caloriesConsumed: 0,
  foodEntries: [],
  completedWorkoutTasks: [],
});

const initialState: AppState = {
  session: null,
  profile: null,
  logs: [defaultLog()],
  streakHistory: [],
  notifications: defaultNotifications,
  leaderboard: [],
  darkMode: true,
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

const lastItem = <T,>(items: T[]) => items[items.length - 1];
const isFriendLeaderboardEntry = (entry: LeaderboardEntry) => entry.id.startsWith('friend-') && !entry.userId;

const normalizeProfile = (profile: UserProfile | null): UserProfile | null => {
  if (!profile) return null;

  return {
    ...profile,
    dailyTargets: generatePlan({
      age: profile.age,
      height: profile.height,
      weight: profile.weight,
      goal: profile.goal,
      dailyAvailableHours: profile.dailyAvailableHours,
    }),
  };
};

const normalizeState = (state: AppState): AppState => ({
  ...initialState,
  ...state,
  profile: normalizeProfile(state.profile),
  logs: state.logs?.length
    ? state.logs.map((log) => ({
        ...defaultLog(),
        ...log,
        completedWorkoutTasks: log.completedWorkoutTasks ?? [],
      }))
    : [defaultLog()],
  notifications: state.notifications?.length ? state.notifications : defaultNotifications,
  leaderboard: state.leaderboard ?? [],
  streakHistory: state.streakHistory ?? [],
  darkMode: state.darkMode ?? true,
});

const isGoalMet = (profile: UserProfile | null, log: DailyLog) => {
  if (!profile) return false;

  return (
    Boolean(log.wakeUpTime) &&
    log.studyMinutes >= profile.dailyTargets.studyHours * 60 &&
    log.waterIntakeMl >= profile.dailyTargets.waterLiters * 1000 &&
    log.caloriesConsumed <= profile.dailyTargets.calories
  );
};

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<AppState>(initialState);
  const [isReady, setIsReady] = useState(false);
  const [currentDayKey, setCurrentDayKey] = useState(todayKey());

  useEffect(() => {
    const boot = async () => {
      const globalState = loadGlobalState();
      const userState = globalState?.session?.userId ? loadUserState(globalState.session.userId) : null;
      const localState = normalizeState({
        ...initialState,
        ...globalState,
        ...userState,
      });
      const hydrated = await hydrateRemoteState(localState);
      setState(normalizeState(hydrated));
      setIsReady(true);
    };

    void boot();
  }, []);

  useEffect(() => {
    setCurrentDayKey(todayKey());

    const interval = window.setInterval(() => {
      setCurrentDayKey(todayKey());
    }, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isReady) {
      saveGlobalState({
        session: state.session,
        darkMode: state.darkMode,
      });

      if (state.session?.userId) {
        saveUserState(state.session.userId, {
          profile: state.profile,
          logs: state.logs,
          streakHistory: state.streakHistory,
          notifications: state.notifications,
          leaderboard: state.leaderboard,
        });
      }

      document.documentElement.classList.toggle('dark', state.darkMode);
    }
  }, [isReady, state]);

  const currentLog = useMemo(() => {
    return state.logs.find((log) => log.date === currentDayKey) ?? { ...defaultLog(), date: currentDayKey };
  }, [currentDayKey, state.logs]);

  const currentScore = useMemo(
    () => computeUserScore(currentLog, state.streakHistory),
    [currentLog, state.streakHistory],
  );

  useEffect(() => {
    if (!state.session || !state.profile) return;

    const unsubscribe = subscribeToLeaderboard((entries) => {
      setState((prev) => ({
        ...prev,
        leaderboard: [...entries, ...prev.leaderboard.filter(isFriendLeaderboardEntry)].sort(
          (first, second) => second.points - first.points,
        ),
      }));
    });

    return () => {
      unsubscribe?.();
    };
  }, [state.session, state.profile]);

  useEffect(() => {
    if (!state.session || !state.profile) return;

    const publish = () =>
      syncLeaderboardPresence({
        userId: state.session!.userId,
        name: state.profile!.name,
        identifier: state.session!.identifier,
        points: currentScore,
      });

    void publish();
    const interval = window.setInterval(() => {
      void publish();
    }, 30_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [currentScore, state.profile, state.session]);

  const upsertLog = async (updater: (log: DailyLog) => DailyLog) => {
    let nextLog: DailyLog | null = null;
    let sessionUserId: string | null = state.session?.userId ?? null;

    setState((prev) => {
      sessionUserId = prev.session?.userId ?? sessionUserId;
      const today = currentDayKey;
      const logs = prev.logs.some((log) => log.date === today)
        ? prev.logs.map((log) => {
            if (log.date !== today) return log;
            nextLog = updater(log);
            return nextLog;
          })
        : [...prev.logs, updater(defaultLog())];

      if (!nextLog) {
        nextLog = logs[logs.length - 1];
      }

      const safeNextLog = nextLog;
      const previousStreak = lastItem(prev.streakHistory);
      const streakValue =
        prev.profile && safeNextLog && isGoalMet(prev.profile, safeNextLog)
          ? (previousStreak?.date === today ? previousStreak.streak : (previousStreak?.streak ?? 0) + 1)
          : previousStreak?.streak ?? 0;

      const streakHistory =
        prev.profile && safeNextLog && isGoalMet(prev.profile, safeNextLog)
          ? [...prev.streakHistory.filter((entry) => entry.date !== today), { date: today, streak: streakValue }]
          : prev.streakHistory;

      return { ...prev, logs, streakHistory };
    });

    if (sessionUserId && nextLog) {
      await syncDailyLog(sessionUserId, nextLog);
    }
  };

  const value: AppContextValue = {
    ...state,
    isReady,
    currentLog,
    login(session) {
      const savedUserState = loadUserState(session.userId);

      setState((prev) =>
        normalizeState({
          ...initialState,
          ...savedUserState,
          session,
          darkMode: prev.darkMode,
        }),
      );
    },
    logout() {
      clearGlobalState();
      setState((prev) => ({
        ...initialState,
        notifications: prev.notifications,
        leaderboard: prev.leaderboard,
      }));
    },
    async completeOnboarding(payload) {
      if (!state.session) return;

      const profile: UserProfile = {
        ...payload,
        userId: state.session.userId,
        dailyTargets: generatePlan(payload),
      };

      setState((prev) => ({ ...prev, profile }));
      await syncProfile(profile);
    },
    async updateProfile(profileUpdate) {
      const profile = state.profile ? { ...state.profile, ...profileUpdate } : null;
      if (!profile) return;

      const recalculatedTargets = generatePlan(profile);
      const nextProfile = { ...profile, dailyTargets: recalculatedTargets };

      setState((prev) => ({ ...prev, profile: nextProfile }));
      await syncProfile(nextProfile);
    },
    async markWakeUp(timeValue) {
      const wakeUpTimestamp = (() => {
        if (!timeValue) {
          return new Date().toISOString();
        }

        const [hours, minutes] = timeValue.split(':').map(Number);
        const date = new Date();
        date.setHours(hours || 0, minutes || 0, 0, 0);
        return date.toISOString();
      })();

      await upsertLog((log) => ({ ...log, wakeUpTime: wakeUpTimestamp }));
    },
    async addStudyMinutes(minutes) {
      await upsertLog((log) => ({ ...log, studyMinutes: Math.max(0, log.studyMinutes + minutes) }));
    },
    async addWater(amount) {
      await upsertLog((log) => ({ ...log, waterIntakeMl: log.waterIntakeMl + amount }));
    },
    async addCaloriesBurned(value) {
      await upsertLog((log) => ({
        ...log,
        caloriesBurned: Math.max(0, log.caloriesBurned + Math.max(0, value)),
      }));
    },
    async addFoodEntry(entry) {
      await upsertLog((log) => ({
        ...log,
        caloriesConsumed: log.caloriesConsumed + entry.calories,
        foodEntries: [entry, ...log.foodEntries],
      }));
    },
    async removeFoodEntry(entryId) {
      await upsertLog((log) => {
        const entry = log.foodEntries.find((item) => item.id === entryId);
        if (!entry) return log;

        return {
          ...log,
          caloriesConsumed: Math.max(0, log.caloriesConsumed - entry.calories),
          foodEntries: log.foodEntries.filter((item) => item.id !== entryId),
        };
      });
    },
    async toggleWorkoutTask(taskId) {
      await upsertLog((log) => ({
        ...log,
        completedWorkoutTasks: log.completedWorkoutTasks.includes(taskId)
          ? log.completedWorkoutTasks.filter((item) => item !== taskId)
          : [...log.completedWorkoutTasks, taskId],
      }));
    },
    addLeaderboardEntry(name, points) {
      setState((prev) => ({
        ...prev,
        leaderboard: [
          ...prev.leaderboard.filter((entry) => entry.name.toLowerCase() !== name.trim().toLowerCase()),
          {
            id: `friend-${randomId()}`,
            name: name.trim(),
            points,
          } satisfies LeaderboardEntry,
        ],
      }));
    },
    toggleDarkMode() {
      setState((prev) => ({ ...prev, darkMode: !prev.darkMode }));
    },
    toggleNotification(id) {
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((item: NotificationItem) =>
          item.id === id ? { ...item, enabled: !item.enabled } : item,
        ),
      }));
    },
    updateNotificationTime(id, time) {
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((item: NotificationItem) =>
          item.id === id ? { ...item, time } : item,
        ),
      }));
    },
    async resetAllData() {
      const currentSession = state.session;
      const preservedDarkMode = state.darkMode;

      if (currentSession?.userId) {
        clearUserState(currentSession.userId);
      }

      setState({
        ...initialState,
        logs: [defaultLog()],
        darkMode: preservedDarkMode,
        session: currentSession
          ? {
              ...currentSession,
              userId: currentSession.userId || `user-${randomId()}`,
            }
          : null,
      });

      if (currentSession?.userId) {
        try {
          await clearCloudData(currentSession.userId);
        } catch (error) {
          console.error('Failed to clear remote user data', error);
        }
      }
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }

  return context;
};
