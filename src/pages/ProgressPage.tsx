import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CardShell } from '../components/CardShell';
import { WeeklyChart } from '../components/WeeklyChart';
import { getLastSevenDays } from '../lib/date';

export const ProgressPage = () => {
  const { logs, streakHistory, profile, currentLog } = useApp();

  const buildSeries = (field: 'studyMinutes' | 'waterIntakeMl' | 'caloriesConsumed') =>
    getLastSevenDays().map((date) => {
      const log = logs.find((entry) => entry.date === date);
      const value =
        field === 'studyMinutes'
          ? Math.round((log?.studyMinutes ?? 0) / 60)
          : field === 'waterIntakeMl'
            ? Number(((log?.waterIntakeMl ?? 0) / 1000).toFixed(2))
            : log?.caloriesConsumed ?? 0;

      return {
        day: date.slice(5),
        value,
      };
    });

  const streakSeries = useMemo(
    () => streakHistory.slice(-7).map((item) => ({ day: item.date.slice(5), value: item.streak })),
    [streakHistory],
  );

  const guideItems = useMemo(() => {
    if (!profile) return [];

    const items = [
      `Finish your ${profile.dailyTargets.workoutMinutes}-minute workout and tick off all workout tasks today.`,
      `Study target is ${profile.dailyTargets.studyHours} hours. You are currently at ${(currentLog.studyMinutes / 60).toFixed(1)} hours.`,
      `Hydration goal is ${profile.dailyTargets.waterLiters}L and calorie target is ${profile.dailyTargets.calories} kcal.`,
    ];

    if (profile.goal === 'Lose Fat') {
      items.push('Keep meals protein-focused and add a short walk after eating whenever you can.');
    } else if (profile.goal === 'Gain Muscle') {
      items.push('Train with control, eat enough protein, and recover well so strength can go up steadily.');
    } else {
      items.push('Stay balanced today: moderate workout intensity, steady meals, and enough sleep tonight.');
    }

    return items;
  }, [currentLog.studyMinutes, profile]);

  return (
    <div className="space-y-5 pb-24">
      <header className="glass rounded-[32px] border border-blue-100 p-5 shadow-card">
        <p className="text-sm uppercase tracking-[0.24em] text-black">Progress Dashboard</p>
        <h1 className="mt-2 font-display text-3xl">Weekly consistency snapshot</h1>
        <p className="muted-text mt-2 text-sm">
          Track your study, water, calories, and streak growth across the last 7 days.
        </p>
      </header>

      <CardShell>
        <p className="text-sm uppercase tracking-[0.24em] text-black">AI Fitness Guide</p>
        <div className="mt-4 space-y-3">
          {guideItems.map((item) => (
            <div key={item} className="soft-surface rounded-2xl px-4 py-3">
              <p className="text-sm text-black">{item}</p>
            </div>
          ))}
        </div>
      </CardShell>

      <WeeklyChart title="Study Hours" data={buildSeries('studyMinutes')} color="#1d7f82" />
      <WeeklyChart title="Water Intake (L)" data={buildSeries('waterIntakeMl')} color="#0ea5e9" />
      <WeeklyChart title="Calories Consumed" data={buildSeries('caloriesConsumed')} color="#4d7b58" />

      <CardShell>
        <p className="text-sm uppercase tracking-[0.24em] text-black">Streak History</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {streakSeries.length ? (
            streakSeries.map((item) => (
              <div key={item.day} className="soft-surface rounded-2xl px-4 py-4">
                <p className="muted-text text-sm">{item.day}</p>
                <p className="mt-2 font-display text-2xl">{item.value} days</p>
              </div>
            ))
          ) : (
            <p className="muted-text text-sm">Complete your goals to start a streak history.</p>
          )}
        </div>
      </CardShell>
    </div>
  );
};
