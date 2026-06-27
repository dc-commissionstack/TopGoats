import React, { useState, useEffect } from 'react';
import { getRank } from './RankBadge';

const TIER_ORDER = ['Kid', 'Yearling', 'Ram', 'Great Goat', 'Top Goat'];
const TIER_COLORS = {
  'Kid': '#888',
  'Yearling': '#6b8e23',
  'Ram': '#cd853f',
  'Great Goat': '#b8860b',
  'Top Goat': '#f7971e',
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/herd/leaderboard?limit=50')
      .then((res) => res.json())
      .then((data) => {
        if (data.leaderboard) setLeaderboard(data.leaderboard);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen text-gray-300 scanlines pt-[100px]">
      <div className="noise" />
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-[-0.03em]">
            Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f7971e] to-[#ffd200]">Leaderboard</span>
          </h1>
          <p className="text-xs text-gray-500">Top artists in the Herd ranked by XP</p>
        </div>

        {/* Leaderboard Table */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] animate-pulse">Loading the Herd...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20 bg-[#0d0d0d] brutal-border rounded-sm">
            <p className="text-sm text-gray-500">No artists in the Herd yet.</p>
            <p className="text-[10px] text-gray-700 mt-2">Be the first to join!</p>
          </div>
        ) : (
          <div className="bg-[#0d0d0d] brutal-border rounded-sm overflow-hidden">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#1a1a1a] text-[9px] font-bold uppercase tracking-[0.25em] text-gray-600">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-1" />
              <div className="col-span-5">Artist</div>
              <div className="col-span-3">Tier</div>
              <div className="col-span-2 text-right">XP</div>
            </div>

            {/* Table rows */}
            {leaderboard.map((entry, i) => {
              const tierColor = TIER_COLORS[entry.tier] || '#888';
              const isTopThree = i < 3;
              
              return (
                <div
                  key={entry.id}
                  className={`grid grid-cols-12 gap-4 px-4 sm:px-6 py-4 items-center border-b border-[#1a1a1a] last:border-0 transition-colors hover:bg-[#1a1a1a]/50 ${
                    isTopThree ? 'bg-[#f7971e]/5' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1 text-center">
                    <span className={`text-sm font-black font-mono ${
                      i === 0 ? 'text-[#ffd200]' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-[#cd853f]' : 'text-gray-600'
                    }`}>
                      {i + 1}
                    </span>
                  </div>

                  {/* Medal for top 3 */}
                  <div className="col-span-1 text-center text-sm">
                    {i === 0 && '👑'}
                    {i === 1 && '🥈'}
                    {i === 2 && '🥉'}
                  </div>

                  {/* Artist info */}
                  <div className="col-span-5 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{entry.display_name}</p>
                    <p className="text-[10px] text-gray-600 truncate">{entry.handle}</p>
                  </div>

                  {/* Tier badge */}
                  <div className="col-span-3">
                    <span
                      className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm border"
                      style={{
                        borderColor: tierColor,
                        color: tierColor,
                        background: `${tierColor}15`,
                      }}
                    >
                      {entry.tier}
                    </span>
                  </div>

                  {/* XP */}
                  <div className="col-span-2 text-right">
                    <span className="text-sm font-mono text-gray-300">{entry.xp.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-8 text-center">
          <p className="text-[9px] text-gray-700 uppercase tracking-[0.3em]">
            Rankings update in real-time as artists earn XP
          </p>
        </div>
      </div>
    </div>
  );
}