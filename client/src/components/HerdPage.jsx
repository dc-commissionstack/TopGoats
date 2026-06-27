import React, { useState, useEffect } from 'react';
import RankBadge from './RankBadge';

const TIERS = [
  { level: 1, name: 'Kid', minXP: 0, color: '#888', icon: '🍼', desc: 'Basic profile, forum access, 5.0% transaction fee.' },
  { level: 2, name: 'Yearling', minXP: 500, color: '#6b8e23', icon: '🌿', desc: 'Custom profile colors, create polls in forums.' },
  { level: 3, name: 'Ram', minXP: 2500, color: '#cd853f', icon: '🐏', desc: 'Early access to new features, 4.5% transaction fee.' },
  { level: 4, name: 'Great Goat', minXP: 10000, color: '#b8860b', icon: '🏔️', desc: 'Featured on Discovery feed, custom URL slug.' },
  { level: 5, name: 'Top Goat', minXP: 50000, color: '#f7971e', icon: '👑', desc: 'VIP Sovereignty Support, 4.0% fee, verified gold check.' },
];

export default function HerdPage({ user }) {
  return (
    <div className="min-h-screen text-gray-300 scanlines pt-[100px]">
      <div className="noise" />
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-[-0.03em]">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f7971e] to-[#ffd200]">Herd</span>
          </h1>
          <p className="text-xs text-gray-500 max-w-xl mx-auto">
            Rise through 5 tiers of sovereignty. Unlock lower fees, exclusive features, and VIP support as you grow.
          </p>
        </div>

        {/* User's Current Rank */}
        {user && (
          <div className="bg-[#0d0d0d] brutal-border rounded-sm p-6 mb-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex-shrink-0">
              <RankBadge xp={user.xp || 0} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{user.display_name || user.handle}</p>
              <p className="text-[10px] text-gray-600">Keep earning XP to unlock the next tier and lower your fees.</p>
            </div>
          </div>
        )}

        {/* Tiers Visualization */}
        <div className="space-y-4">
          {TIERS.map((tier, i) => {
            const isUnlocked = user && (user.xp || 0) >= tier.minXP;
            const isCurrent = user && (user.xp || 0) >= tier.minXP && 
              (i === TIERS.length - 1 || (user.xp || 0) < TIERS[i + 1].minXP);
            
            return (
              <div
                key={tier.level}
                className={`relative bg-[#0d0d0d] brutal-border rounded-sm p-6 transition-all duration-300 ${
                  isCurrent ? 'border-[#f7971e]/50 bg-[#f7971e]/5' : ''
                } ${isUnlocked ? 'opacity-100' : 'opacity-50'}`}
              >
                {/* Tier number */}
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className={`w-10 h-10 rounded-sm flex items-center justify-center text-lg flex-shrink-0 border ${
                    isCurrent ? 'border-[#f7971e] bg-[#f7971e]/10' : 'border-[#2a2a2a]'
                  }`}>
                    <span>{tier.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2 mb-1">
                      <h3 className="text-base font-bold text-white uppercase tracking-wider">{tier.name}</h3>
                      <span className="text-[10px] text-gray-600 font-mono">{tier.minXP.toLocaleString()} XP</span>
                    </div>
                    <p className="text-[11px] text-gray-500">{tier.desc}</p>
                  </div>

                  {/* Unlocked check */}
                  {isUnlocked && (
                    <span className="text-[#4ade80] text-sm flex-shrink-0">✓</span>
                  )}
                </div>

                {/* Progress bar (only for current tier) */}
                {isCurrent && user && (
                  <div className="mt-4">
                    <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${((user.xp - tier.minXP) / ((TIERS[i + 1]?.minXP || user.xp) - tier.minXP)) * 100}%`,
                          background: tier.color,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-600 mt-1">
                      {user.xp.toLocaleString()} / {TIERS[i + 1]?.minXP.toLocaleString() || 'MAX'} XP to next rank
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* XP Rules Reference */}
        <div className="mt-16 bg-[#0d0d0d] brutal-border rounded-sm p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 mb-4">How to Earn XP</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-[11px]">
            <div>
              <p className="text-white font-bold uppercase tracking-wider mb-2 text-[10px]">Community</p>
              <ul className="space-y-1 text-gray-500">
                <li>Post created: +10 XP</li>
                <li>Comment/Reply: +5 XP</li>
                <li>Upvote received: +2 XP</li>
                <li>Accepted answer: +50 XP</li>
                <li>Weekly check-in: +20 XP</li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold uppercase tracking-wider mb-2 text-[10px]">Platform</p>
              <ul className="space-y-1 text-gray-500">
                <li>First upload: +100 XP</li>
                <li>Copyright fingerprint: +50 XP</li>
                <li>Profile complete: +200 XP</li>
                <li>Link storefront: +50 XP</li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold uppercase tracking-wider mb-2 text-[10px]">Commerce</p>
              <ul className="space-y-1 text-gray-500">
                <li>First sale: +500 XP</li>
                <li>Every $10 sales: +50 XP</li>
                <li>5-star review: +25 XP</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}