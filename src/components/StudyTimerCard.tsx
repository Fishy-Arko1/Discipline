import { useEffect, useState } from 'react';
import { Pause, Play, Square } from 'lucide-react';
import { formatDuration } from '../lib/date';
import { CardShell } from './CardShell';

interface StudyTimerCardProps {
  onSave: (minutes: number) => Promise<void>;
}

export const StudyTimerCard = ({ onSave }: StudyTimerCardProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const timer = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning]);

  const commitSession = async () => {
    setIsRunning(false);
    const sessionSeconds = elapsedSeconds;
    setElapsedSeconds(0);
    const minutes = Math.max(1, Math.round(sessionSeconds / 60));
    await onSave(minutes);
  };

  return (
    <CardShell>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-black">Study Timer</p>
          <h3 className="mt-2 font-display text-2xl">{formatDuration(elapsedSeconds)}</h3>
          <p className="mt-2 text-sm text-black">{isRunning ? 'Timer is running' : 'Start a session and save it when done'}</p>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => setIsRunning(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-100 px-4 py-3 font-semibold text-black"
        >
          <Play size={18} />
          Start
        </button>
        <button
          type="button"
          onClick={() => setIsRunning(false)}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 font-semibold text-black"
        >
          <Pause size={18} />
          Pause
        </button>
      </div>

      <button
        type="button"
        onClick={commitSession}
        disabled={elapsedSeconds === 0}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 px-4 py-3 font-semibold text-black disabled:opacity-40"
      >
        <Square size={18} />
        Stop & save
      </button>
    </CardShell>
  );
};
