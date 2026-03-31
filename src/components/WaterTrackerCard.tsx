import { CupSoda } from 'lucide-react';
import { UserProfile } from '../types';
import { percent } from '../lib/utils';
import { CardShell } from './CardShell';
import { ProgressBar } from './ProgressBar';

interface WaterTrackerCardProps {
  currentMl: number;
  profile: UserProfile;
  onAdd: (amount: number) => Promise<void>;
}

export const WaterTrackerCard = ({ currentMl, profile, onAdd }: WaterTrackerCardProps) => (
  <CardShell>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-black">Water Tracker</p>
        <h3 className="mt-2 font-display text-2xl">{(currentMl / 1000).toFixed(2)}L</h3>
      </div>
      <div className="rounded-2xl bg-sky-500/15 p-3 text-sky-600">
        <CupSoda size={18} />
      </div>
    </div>

    <p className="mt-3 text-sm text-black">
      Goal: {profile.dailyTargets.waterLiters}L ({profile.dailyTargets.waterLiters * 1000} ml)
    </p>
    <div className="mt-4">
      <ProgressBar value={percent(currentMl, profile.dailyTargets.waterLiters * 1000)} colorClass="bg-sky-500" />
    </div>

    <div className="mt-4 flex gap-3">
      <button
        type="button"
        onClick={() => void onAdd(250)}
        className="flex-1 rounded-2xl bg-blue-50 px-4 py-3 font-semibold text-black"
      >
        +250ml
      </button>
      <button
        type="button"
        onClick={() => void onAdd(500)}
        className="flex-1 rounded-2xl bg-blue-100 px-4 py-3 font-semibold text-black"
      >
        +500ml
      </button>
    </div>
  </CardShell>
);
