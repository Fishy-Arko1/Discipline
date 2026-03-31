import { useMemo, useState } from 'react';
import { BellDot, Flame, MoonStar, SunMedium } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLastSevenDays } from '../lib/date';
import { CardShell } from '../components/CardShell';
import { HomeOverview } from '../components/HomeOverview';
import { ProgressBar } from '../components/ProgressBar';
import { StreakBadge } from '../components/StreakBadge';
import { StudyTimerCard } from '../components/StudyTimerCard';
import { WakeUpCard } from '../components/WakeUpCard';
import { WaterTrackerCard } from '../components/WaterTrackerCard';
import { WeeklyChart } from '../components/WeeklyChart';
import { WorkoutPlanCard } from '../components/WorkoutPlanCard';
import { percent } from '../lib/utils';
import { requestNotificationPermission, sendLocalNotification } from '../services/notifications';

export const HomePage = () => {
  const {
    profile,
    currentLog,
    logs,
    streakHistory,
    notifications,
    markWakeUp,
    addStudyMinutes,
    addWater,
    addCaloriesBurned,
    toggleWorkoutTask,
    toggleDarkMode,
    darkMode,
  } = useApp();

  const [caloriesBurned, setCaloriesBurnedInput] = useState(0);

  const weeklyStudyData = useMemo(
    () =>
      getLastSevenDays().map((date) => ({
        day: date.slice(5),
        value: Math.round((logs.find((log) => log.date === date)?.studyMinutes ?? 0) / 60),
      })),
    [logs],
  );
  const netCaloriesToday = currentLog.caloriesConsumed - currentLog.caloriesBurned;

  if (!profile) return null;

  return (
    <div className="page-enter space-y-5 pb-24">
      <header className="glass hero-glow rounded-[36px] border border-blue-100 p-5 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-black">Today's Focus</p>
            <h1 className="mt-2 max-w-2xl font-display text-3xl sm:text-4xl">
              Hi {profile.name}, keep the chain alive.
            </h1>
            <p className="muted-text mt-2 text-sm">
              Workout {profile.dailyTargets.workoutMinutes} mins | Study {profile.dailyTargets.studyHours} hrs | Water{' '}
              {profile.dailyTargets.waterLiters}L
            </p>
          </div>

          <button
            type="button"
            onClick={toggleDarkMode}
            className="soft-surface panel-hover rounded-2xl p-3"
            aria-label="Toggle theme"
          >
            {darkMode ? <SunMedium size={18} /> : <MoonStar size={18} />}
          </button>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <CardShell className="border-none bg-gradient-to-br from-white/95 via-white/90 to-orange-50/80 dark:from-[#0d0d0d] dark:via-[#101010] dark:to-[#1b1108]">
            <p className="text-sm uppercase tracking-[0.24em] text-black">Calorie Target</p>
            <h2 className="mt-2 font-display text-3xl">{profile.dailyTargets.calories} kcal</h2>
            <div className="mt-4">
              <ProgressBar
                value={percent(currentLog.caloriesConsumed, profile.dailyTargets.calories)}
                colorClass="bg-gradient-to-r from-orange-500 via-amber-400 to-blue-500"
              />
            </div>
            <p className="muted-text mt-3 text-sm">
              Consumed {currentLog.caloriesConsumed} kcal | Burned {currentLog.caloriesBurned} kcal | Net {netCaloriesToday} kcal
            </p>
          </CardShell>

          <StreakBadge streak={streakHistory[streakHistory.length - 1]?.streak ?? 0} />
        </div>
      </header>

      <WakeUpCard
        wakeUpTime={currentLog.wakeUpTime}
        profile={profile}
        onMark={async (timeValue) => {
          await markWakeUp(timeValue);
          sendLocalNotification('Wake-up saved', 'Your wake-up time has been updated for today.');
        }}
      />

      <WorkoutPlanCard profile={profile} log={currentLog} onToggleTask={toggleWorkoutTask} />

      <HomeOverview profile={profile} log={currentLog} />

      <div className="grid gap-4 lg:grid-cols-2">
        <StudyTimerCard
          onSave={async (minutes) => {
            await addStudyMinutes(minutes);
            sendLocalNotification('Study session saved', `Added ${minutes} study minutes to today.`);
          }}
        />
        <WaterTrackerCard
          currentMl={currentLog.waterIntakeMl}
          profile={profile}
          onAdd={async (amount) => {
            await addWater(amount);
            sendLocalNotification('Hydration update', `Added ${amount}ml water.`);
          }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <WeeklyChart title="Study Hours" data={weeklyStudyData} color="#1d7f82" />

        <CardShell className="bg-gradient-to-br from-white/85 to-orange-50 dark:from-[#101010] dark:to-[#16110b]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-black">Calories Burned</p>
              <h3 className="mt-2 font-display text-2xl">{currentLog.caloriesBurned} kcal</h3>
              <p className="muted-text mt-2 text-sm">Net calories today: {netCaloriesToday} kcal</p>
            </div>
            <Flame size={18} className="text-orange-500" />
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-medium">Add burned calories</span>
            <input
              type="number"
              value={caloriesBurned}
              onChange={(event) => setCaloriesBurnedInput(Number(event.target.value))}
              min={0}
              className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-3 text-black outline-none focus:border-clay"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              const amount = Number(caloriesBurned);
              if (!Number.isFinite(amount) || amount <= 0) return;

              void addCaloriesBurned(amount);
              setCaloriesBurnedInput(0);
            }}
            className="mt-4 w-full rounded-2xl bg-blue-100 px-4 py-3 font-semibold text-black transition duration-300 hover:-translate-y-0.5 hover:bg-blue-200 dark:bg-orange-500/20 dark:text-orange-50 dark:hover:bg-orange-500/30"
          >
            Add to burned calories
          </button>

          <div className="soft-surface muted-text mt-4 rounded-2xl px-4 py-3 text-sm">
            Add each activity separately and the total burned calories will keep increasing through the day.
          </div>
        </CardShell>
      </div>

      <CardShell>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-black">Reminders</p>
            <h3 className="mt-2 font-display text-2xl">Daily notifications</h3>
          </div>
          <button
            type="button"
            onClick={() => void requestNotificationPermission()}
            className="soft-surface panel-hover flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-black"
          >
            <BellDot size={18} />
            Enable
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {notifications.map((item) => (
            <div key={item.id} className="soft-surface flex items-center justify-between rounded-2xl px-4 py-3">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="muted-text text-sm">{item.time}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  item.enabled ? 'bg-blue-100 text-black' : 'bg-blue-50 text-black'
                }`}
              >
                {item.enabled ? 'On' : 'Off'}
              </span>
            </div>
          ))}
        </div>
      </CardShell>
    </div>
  );
};
