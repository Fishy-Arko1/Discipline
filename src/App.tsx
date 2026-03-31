import { MoonStar, SunMedium } from 'lucide-react';
import { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { BrandLogo } from './components/BrandLogo';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { OTPLoginForm } from './components/OTPLoginForm';
import { OnboardingForm } from './components/OnboardingForm';
import { useApp } from './context/AppContext';
import { AppTab } from './types';
import { HomePage } from './pages/HomePage';
import { ProgressPage } from './pages/ProgressPage';
import { ProfilePage } from './pages/ProfilePage';
import { ScanFoodPage } from './pages/ScanFoodPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AICompanionPage } from './pages/AICompanionPage';

const App = () => {
  const { isReady, session, profile, login, completeOnboarding, darkMode, toggleDarkMode } = useApp();
  const [tab, setTab] = useState<AppTab>('home');

  if (!isReady) {
    return <LoadingSkeleton />;
  }

  if (!session) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-8">
        <OTPLoginForm onLogin={login} />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-8">
        <OnboardingForm onSubmit={completeOnboarding} />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-5 pb-32 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <BrandLogo compact />
        <button
          type="button"
          onClick={toggleDarkMode}
          className="soft-surface panel-hover rounded-2xl border border-blue-100 px-4 py-3 text-sm font-semibold text-black dark:border-orange-400/30 dark:bg-orange-500/15 dark:text-orange-100"
        >
          <span className="inline-flex items-center gap-2">
            {darkMode ? <SunMedium size={16} /> : <MoonStar size={16} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
      </div>
      {tab === 'home' && <HomePage />}
      {tab === 'progress' && <ProgressPage />}
      {tab === 'leaderboard' && <LeaderboardPage />}
      {tab === 'companion' && <AICompanionPage />}
      {tab === 'scan' && <ScanFoodPage />}
      {tab === 'profile' && <ProfilePage />}
      <BottomNav activeTab={tab} onChange={setTab} />
    </main>
  );
};

export default App;
