import { CheckSquare2, Dumbbell, Square } from 'lucide-react';
import { DailyLog, UserProfile } from '../types';
import { CardShell } from './CardShell';

interface WorkoutPlanCardProps {
  profile: UserProfile;
  log: DailyLog;
  onToggleTask: (taskId: string) => Promise<void>;
}

export const WorkoutPlanCard = ({ profile, log, onToggleTask }: WorkoutPlanCardProps) => {
  const workoutPlan = profile.dailyTargets?.workoutPlan;

  if (!workoutPlan) {
    return null;
  }

  const completedCount = workoutPlan.dailyChecklist.filter((task) =>
    log.completedWorkoutTasks.includes(task.id),
  ).length;

  return (
    <CardShell className="hero-glow overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-100 dark:from-[#140f0a] dark:via-[#0c0c0c] dark:to-[#1b1208]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-black">Today's Workout</p>
          <h3 className="mt-2 font-display text-2xl">{workoutPlan.title}</h3>
          <p className="muted-text mt-3 text-sm">{workoutPlan.summary}</p>
        </div>
        <div className="rounded-2xl bg-orange-100 p-3 text-black dark:bg-orange-500/15 dark:text-orange-100">
          <Dumbbell size={18} />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {workoutPlan.dailyChecklist.map((task) => {
          const checked = log.completedWorkoutTasks.includes(task.id);

          return (
            <button
              key={task.id}
              type="button"
              onClick={() => void onToggleTask(task.id)}
              className="soft-surface flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition duration-300 hover:-translate-y-0.5 hover:bg-orange-500/10"
            >
              {checked ? <CheckSquare2 size={18} /> : <Square size={18} />}
              <span className="text-sm font-medium text-black">{task.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/80 px-4 py-4 dark:bg-orange-500/10">
          <p className="text-xs uppercase tracking-[0.18em] text-black">Tasks Done</p>
          <p className="mt-2 text-2xl font-semibold text-black">
            {completedCount}/{workoutPlan.dailyChecklist.length}
          </p>
        </div>
        <div className="rounded-2xl bg-white/80 px-4 py-4 dark:bg-orange-500/10">
          <p className="text-xs uppercase tracking-[0.18em] text-black">Calories Burned</p>
          <p className="mt-2 text-2xl font-semibold text-black">{log.caloriesBurned} kcal</p>
        </div>
        <div className="rounded-2xl bg-white/80 px-4 py-4 dark:bg-orange-500/10">
          <p className="text-xs uppercase tracking-[0.18em] text-black">Calories Gained</p>
          <p className="mt-2 text-2xl font-semibold text-black">{log.caloriesConsumed} kcal</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-orange-200/60 bg-orange-50 px-4 py-4 text-black dark:border-orange-400/25 dark:bg-orange-500/10">
        <p className="text-sm uppercase tracking-[0.2em] text-black">Recovery Tip</p>
        <p className="mt-2 text-sm">{workoutPlan.recoveryTip}</p>
      </div>
    </CardShell>
  );
};
