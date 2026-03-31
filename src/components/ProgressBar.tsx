import { classNames } from '../lib/utils';

interface ProgressBarProps {
  value: number;
  colorClass?: string;
}

export const ProgressBar = ({ value, colorClass = 'bg-moss' }: ProgressBarProps) => (
  <div className="progress-glow h-3 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
    <div
      className={classNames('h-full rounded-full shadow-[0_0_18px_rgba(59,130,246,0.2)] transition-all duration-700 ease-out', colorClass)}
      style={{ width: `${Math.max(6, value)}%` }}
    />
  </div>
);
