import { BarChart3, Bot, House, ScanSearch, Trophy, UserCircle2 } from 'lucide-react';
import { AppTab } from '../types';
import { classNames } from '../lib/utils';

const items: Array<{ id: AppTab; label: string; icon: typeof House }> = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'companion', label: 'AI Companion', icon: Bot },
  { id: 'scan', label: 'Scan Food', icon: ScanSearch },
  { id: 'profile', label: 'Profile', icon: UserCircle2 },
];

interface BottomNavProps {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
}

export const BottomNav = ({ activeTab, onChange }: BottomNavProps) => (
  <nav className="glass fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-1rem)] max-w-4xl -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-[30px] border border-white/60 px-2 py-2 shadow-card dark:border-orange-400/30">
    {items.map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        type="button"
        onClick={() => onChange(id)}
        className={classNames(
          'flex min-w-[82px] flex-1 flex-col items-center gap-1 rounded-[24px] px-3 py-2 text-[11px] font-medium transition-all duration-300',
          activeTab === id
            ? 'bg-gradient-to-r from-orange-500/90 to-amber-400/80 text-white shadow-[0_16px_32px_rgba(249,115,22,0.28)]'
            : 'text-black hover:bg-white/60 dark:text-zinc-100 dark:hover:bg-orange-500/10',
        )}
      >
        <Icon size={18} />
        <span>{label}</span>
      </button>
    ))}
  </nav>
);
