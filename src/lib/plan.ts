import { DailyTargets, GoalType, WorkoutPlan } from '../types';

const goalCalories: Record<GoalType, number> = {
  'Lose Fat': -350,
  'Gain Muscle': 250,
  Maintain: 0,
};

const buildWorkoutPlan = (goal: GoalType, workoutMinutes: number): WorkoutPlan => {
  if (goal === 'Lose Fat') {
    return {
      title: 'Daily basic fat-loss workout',
      summary: `Use ${workoutMinutes} minutes today for simple cardio and full-body movement that helps burn calories without losing muscle.`,
      dailyChecklist: [
        { id: 'warmup', label: '5 minutes warm-up walk or marching' },
        { id: 'strength', label: '15 minutes squats, push-ups, rows, and lunges' },
        { id: 'cardio', label: '15 minutes brisk walk, cycle, jog, or skipping' },
        { id: 'core', label: '5 minutes planks and stretching cooldown' },
      ],
      recoveryTip: 'Keep rest periods short, aim for 8,000 to 10,000 daily steps, and protect sleep so recovery stays high.',
    };
  }

  if (goal === 'Gain Muscle') {
    return {
      title: 'Daily basic muscle workout',
      summary: `Use ${workoutMinutes} minutes today for controlled resistance work and steady progression.`,
      dailyChecklist: [
        { id: 'warmup', label: '5 minutes mobility and warm-up' },
        { id: 'compound', label: '20 minutes compound lifts or bodyweight strength work' },
        { id: 'accessory', label: '10 minutes accessory reps for weak muscle groups' },
        { id: 'cooldown', label: '5 minutes cooldown and protein meal planning' },
      ],
      recoveryTip: 'Prioritize protein, increase weights gradually, and leave at least 48 hours before training the same muscle hard again.',
    };
  }

  return {
    title: 'Daily basic maintenance workout',
    summary: `Aim for ${workoutMinutes} minutes today to maintain fitness, strength, and a balanced routine.`,
    dailyChecklist: [
      { id: 'warmup', label: '5 minutes warm-up and joint mobility' },
      { id: 'strength', label: '15 minutes full-body strength movements' },
      { id: 'cardio', label: '10 minutes walking, cycling, or light cardio' },
      { id: 'cooldown', label: '5 minutes stretching and breathing' },
    ],
    recoveryTip: 'Keep intensity moderate, stay active on non-gym days, and use consistency rather than extremes.',
  };
};

export const generatePlan = ({
  age,
  height,
  weight,
  goal,
  dailyAvailableHours,
}: {
  age: number;
  height: number;
  weight: number;
  goal: GoalType;
  dailyAvailableHours: number;
}): DailyTargets => {
  const baseCalories = 10 * weight + 6.25 * height - 5 * age + 5;
  const adjustedCalories = Math.round(baseCalories + 300 + goalCalories[goal]);
  const workoutMinutes = Math.min(60, Math.max(30, Math.round(dailyAvailableHours * 10)));
  const studyHours = Math.min(6, Math.max(2, Math.round(dailyAvailableHours * 0.75)));
  const waterLiters = Number(Math.min(4, Math.max(2, weight / 25)).toFixed(1));
  const workoutPlan = buildWorkoutPlan(goal, workoutMinutes);

  return {
    wakeUpGoal: '06:00',
    workoutMinutes,
    studyHours,
    waterLiters,
    calories: adjustedCalories,
    workoutPlan,
  };
};
