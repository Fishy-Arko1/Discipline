import { FormEvent, useMemo, useState } from 'react';
import { Globe2, Trophy, UserPlus, Users, Wifi, WifiOff } from 'lucide-react';
import { CardShell } from '../components/CardShell';
import { useApp } from '../context/AppContext';
import { computeUserScore } from '../lib/score';
import { isFirebaseConfigured } from '../services/firebase';
import { LeaderboardEntry } from '../types';

const friendPrefix = 'friend-';
const isFriendEntry = (entry: LeaderboardEntry) => entry.id.startsWith(friendPrefix) && !entry.userId;

const getTierDetails = (points: number) => {
  if (points >= 450) {
    return {
      label: 'Elite',
      tone: 'border-orange-400/40 bg-orange-500/15 text-orange-100',
    };
  }

  if (points >= 300) {
    return {
      label: 'Pro',
      tone: 'border-amber-300/35 bg-amber-400/15 text-amber-100',
    };
  }

  if (points >= 150) {
    return {
      label: 'Rising',
      tone: 'border-sky-300/35 bg-sky-400/15 text-sky-100',
    };
  }

  return {
    label: 'Starter',
    tone: 'border-zinc-300/20 bg-zinc-500/10 text-zinc-200',
  };
};

const formatLastSeen = (lastSeen?: string) => {
  if (!lastSeen) return 'Offline';

  return `Last seen ${new Date(lastSeen).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })}`;
};

type RankedEntry = LeaderboardEntry & {
  rank: number;
  displayName: string;
  statusText: string;
  tierLabel: string;
  tierTone: string;
};

const rankEntries = (entries: LeaderboardEntry[], currentUserId?: string) =>
  entries
    .sort((first, second) => second.points - first.points)
    .map((entry, index) => {
      const tier = getTierDetails(entry.points);

      return {
        ...entry,
        rank: index + 1,
        displayName: entry.userId === currentUserId ? `${entry.name} (You)` : entry.name,
        statusText: entry.isOnline ? 'Online now' : formatLastSeen(entry.lastSeen),
        tierLabel: tier.label,
        tierTone: tier.tone,
      } satisfies RankedEntry;
    });

const LeaderboardRow = ({
  entry,
  statusVariant = 'global',
}: {
  entry: RankedEntry;
  statusVariant?: 'global' | 'friend';
}) => (
  <div className="soft-surface flex flex-col gap-3 rounded-[24px] border border-orange-400/15 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-start gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-sky-400/15 text-lg font-semibold text-black">
        #{entry.rank}
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-black">{entry.displayName}</p>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${entry.tierTone}`}>
            {entry.tierLabel}
          </span>
        </div>
        <p className="muted-text mt-1 text-sm">
          {statusVariant === 'friend' ? 'Friend leaderboard entry' : entry.statusText}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3 self-end sm:self-auto">
      {statusVariant === 'global' ? (
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
            entry.isOnline
              ? 'border-emerald-400/35 bg-emerald-500/15 text-emerald-100'
              : 'border-zinc-300/20 bg-zinc-500/10 text-zinc-200'
          }`}
        >
          {entry.isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          {entry.isOnline ? 'Active' : 'Offline'}
        </span>
      ) : null}

      <span className="rounded-full border border-orange-400/25 bg-orange-500/15 px-3 py-1 text-sm font-semibold text-orange-50">
        {entry.points} pts
      </span>
    </div>
  </div>
);

export const LeaderboardPage = () => {
  const { session, profile, currentLog, streakHistory, leaderboard, addLeaderboardEntry } = useApp();
  const [friendName, setFriendName] = useState('');
  const [friendPoints, setFriendPoints] = useState('');

  const yourPoints = useMemo(() => computeUserScore(currentLog, streakHistory), [currentLog, streakHistory]);

  const friendRows = useMemo(() => {
    const localFriends = leaderboard.filter(isFriendEntry);
    const youEntry =
      profile !== null
        ? [
            {
              id: `friend-self-${profile.userId}`,
              userId: profile.userId,
              name: profile.name,
              points: yourPoints,
              isOnline: true,
            } satisfies LeaderboardEntry,
          ]
        : [];

    return rankEntries([...localFriends, ...youEntry], profile?.userId);
  }, [leaderboard, profile, yourPoints]);

  const globalRows = useMemo(() => {
    const remoteEntries = leaderboard.filter((entry) => !isFriendEntry(entry));
    const mergedById = new Map<string, LeaderboardEntry>();

    remoteEntries.forEach((entry) => {
      const key = entry.userId ?? entry.id;
      const current = mergedById.get(key);

      if (!current || entry.points >= current.points || (!!entry.isOnline && !current.isOnline)) {
        mergedById.set(key, entry);
      }
    });

    if (profile) {
      const existing = mergedById.get(profile.userId);

      mergedById.set(profile.userId, {
        id: existing?.id ?? profile.userId,
        userId: profile.userId,
        name: profile.name,
        identifier: session?.identifier,
        lastSeen: existing?.lastSeen ?? new Date().toISOString(),
        isOnline: true,
        points: yourPoints,
      });
    }

    return rankEntries(Array.from(mergedById.values()), profile?.userId);
  }, [leaderboard, profile, session?.identifier, yourPoints]);

  const activeUsers = globalRows.filter((entry) => entry.isOnline).length;
  const yourGlobalRank = globalRows.find((entry) => entry.userId === profile?.userId)?.rank ?? 0;

  const handleAddFriend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanedName = friendName.trim();
    const parsedPoints = Number(friendPoints);

    if (!cleanedName || !friendPoints.trim() || Number.isNaN(parsedPoints)) return;

    addLeaderboardEntry(cleanedName, Math.max(0, Math.round(parsedPoints)));
    setFriendName('');
    setFriendPoints('');
  };

  return (
    <div className="space-y-5 pb-28">
      <header className="glass hero-glow rounded-[32px] border border-orange-400/20 p-5 shadow-card">
        <p className="text-sm uppercase tracking-[0.24em] text-black">Leaderboard</p>
        <h1 className="mt-2 font-display text-3xl text-black">See your friend rank and the full OKRA board</h1>
        <p className="muted-text mt-2 max-w-2xl text-sm">
          Friend rankings are saved for you locally, while the global leaderboard keeps every synced user ranked by
          points whether they are active right now or offline.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardShell>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-3 text-black">
              <Trophy size={18} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-black">Your Score</p>
              <p className="text-2xl font-semibold text-black">{yourPoints} pts</p>
            </div>
          </div>
        </CardShell>

        <CardShell>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-3 text-black">
              <Users size={18} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-black">Friends Tracked</p>
              <p className="text-2xl font-semibold text-black">{Math.max(friendRows.length - 1, 0)}</p>
            </div>
          </div>
        </CardShell>

        <CardShell>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-3 text-black">
              <Globe2 size={18} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-black">Global Players</p>
              <p className="text-2xl font-semibold text-black">{globalRows.length}</p>
            </div>
          </div>
        </CardShell>

        <CardShell>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-3 text-black">
              <Wifi size={18} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-black">Global Rank</p>
              <p className="text-2xl font-semibold text-black">{yourGlobalRank ? `#${yourGlobalRank}` : '--'}</p>
              <p className="muted-text mt-1 text-xs">{activeUsers} active now</p>
            </div>
          </div>
        </CardShell>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr,1.05fr]">
        <CardShell>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-3 text-black">
              <UserPlus size={18} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-black">Add A Friend</p>
              <p className="muted-text mt-1 text-sm">Enter a friend and their current score to compare locally.</p>
            </div>
          </div>

          <form className="mt-5 grid gap-3 sm:grid-cols-[1fr,180px] sm:items-end" onSubmit={handleAddFriend}>
            <label className="space-y-2">
              <span className="text-sm font-medium text-black">Friend name</span>
              <input
                className="w-full rounded-2xl border border-orange-400/20 bg-white/70 px-4 py-3 text-black outline-none transition focus:border-orange-400 dark:bg-zinc-950/70"
                placeholder="Add a friend"
                value={friendName}
                onChange={(event) => setFriendName(event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-black">Points</span>
              <input
                className="w-full rounded-2xl border border-orange-400/20 bg-white/70 px-4 py-3 text-black outline-none transition focus:border-orange-400 dark:bg-zinc-950/70"
                inputMode="numeric"
                min="0"
                placeholder="290"
                type="number"
                value={friendPoints}
                onChange={(event) => setFriendPoints(event.target.value)}
              />
            </label>

            <button
              className="rounded-2xl border border-orange-400/30 bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-3 font-semibold text-black transition hover:scale-[1.01] sm:col-span-2"
              type="submit"
            >
              Save friend to leaderboard
            </button>
          </form>
        </CardShell>

        <CardShell>
          <p className="text-sm uppercase tracking-[0.24em] text-black">Point Bands</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { min: '450+', label: 'Elite', tone: 'border-orange-400/40 bg-orange-500/15 text-orange-100' },
              { min: '300+', label: 'Pro', tone: 'border-amber-300/35 bg-amber-400/15 text-amber-100' },
              { min: '150+', label: 'Rising', tone: 'border-sky-300/35 bg-sky-400/15 text-sky-100' },
              { min: '0+', label: 'Starter', tone: 'border-zinc-300/20 bg-zinc-500/10 text-zinc-200' },
            ].map((band) => (
              <div key={band.label} className={`rounded-[22px] border px-4 py-4 ${band.tone}`}>
                <p className="text-sm uppercase tracking-[0.22em]">{band.label}</p>
                <p className="mt-2 text-xl font-semibold">{band.min} pts</p>
              </div>
            ))}
          </div>

          <div className="soft-surface mt-4 rounded-[22px] px-4 py-4">
            <p className="text-sm text-black">
              A player with 490 points will rank above someone with 290 points, and both the rank plus badge will
              update automatically.
            </p>
          </div>
        </CardShell>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <CardShell>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-black">Friend Leaderboard</p>
              <p className="muted-text mt-1 text-sm">Your private comparison board with saved friend scores.</p>
            </div>
            <span className="rounded-full border border-orange-400/25 bg-orange-500/15 px-3 py-1 text-xs font-semibold text-orange-100">
              {friendRows.length} tracked
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {friendRows.map((entry) => (
              <LeaderboardRow key={entry.id} entry={entry} statusVariant="friend" />
            ))}
          </div>
        </CardShell>

        <CardShell>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-black">Global Leaderboard</p>
              <p className="muted-text mt-1 text-sm">
                {isFirebaseConfigured
                  ? 'All synced users stay ranked here even when they go offline.'
                  : 'Connect Firebase to sync the global board across every OKRA user.'}
              </p>
            </div>
            <span className="rounded-full border border-orange-400/25 bg-orange-500/15 px-3 py-1 text-xs font-semibold text-orange-100">
              {activeUsers} active now
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {globalRows.length ? (
              globalRows.map((entry) => <LeaderboardRow key={entry.id} entry={entry} statusVariant="global" />)
            ) : (
              <div className="soft-surface rounded-[22px] px-4 py-4">
                <p className="text-sm text-black">
                  Global ranking will appear here once user scores are synced into the shared leaderboard.
                </p>
              </div>
            )}
          </div>
        </CardShell>
      </div>
    </div>
  );
};
