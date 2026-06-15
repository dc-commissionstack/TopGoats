// XP thresholds per researcher/community_ranking_logic.md
const RANKS = [
  { level: 1, name: 'Kid', minXP: 0, color: '#888', icon: '🍼' },
  { level: 2, name: 'Yearling', minXP: 500, color: '#6b8e23', icon: '🌿' },
  { level: 3, name: 'Ram', minXP: 2500, color: '#cd853f', icon: '🐏' },
  { level: 4, name: 'Great Goat', minXP: 10000, color: '#b8860b', icon: '🏔️' },
  { level: 5, name: 'Top Goat', minXP: 50000, color: '#f7971e', icon: '👑' },
];

export function getRank(xp) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.minXP) rank = r;
  }
  return rank;
}

export function getNextRank(xp) {
  for (let i = 0; i < RANKS.length - 1; i++) {
    if (xp < RANKS[i + 1].minXP) return RANKS[i + 1];
  }
  return null;
}

export function getXpProgress(xp) {
  const current = getRank(xp);
  const next = getNextRank(xp);
  if (!next) return 1;
  const range = next.minXP - current.minXP;
  const progress = (xp - current.minXP) / range;
  return Math.min(Math.max(progress, 0), 1);
}

export default function RankBadge({ xp, size = 'md' }) {
  const rank = getRank(xp);
  const nextRank = getNextRank(xp);
  const progress = getXpProgress(xp);

  return (
    <div className="inline-flex flex-col gap-1">
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 rounded text-xs font-bold uppercase tracking-wider transition-all"
        style={{
          borderColor: rank.color,
          color: rank.color,
          background: `${rank.color}11`,
        }}
      >
        <span className="text-sm">{rank.icon}</span>
        <span>{rank.name}</span>
      </div>
      {nextRank && (
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden" style={{ minWidth: 60 }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.round(progress * 100)}%`, background: rank.color }}
            />
          </div>
          <span className="whitespace-nowrap">{xp.toLocaleString()}/{nextRank.minXP.toLocaleString()} XP → {nextRank.name}</span>
        </div>
      )}
    </div>
  );
}

export { RANKS };