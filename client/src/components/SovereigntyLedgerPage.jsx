import React, { useState, useEffect } from 'react';

const MOCK_GRANTS = [
  { id: '1', title: 'IP Defense Fund — Vex Echo', amount: 2500, date: '2026-06-20', type: 'Legal', description: 'Emergency copyright defense for unauthorized sampling case.' },
  { id: '2', title: 'Studio Access Grant — Lo-Fi Collective', amount: 1500, date: '2026-06-15', type: 'Equipment', description: 'Funding for home studio equipment for 5 emerging producers.' },
  { id: '3', title: 'Mental Health Stipend — Underground Network', amount: 3000, date: '2026-06-10', type: 'Wellness', description: 'Mental health support stipends for independent artists.' },
  { id: '4', title: 'Distribution Fund — Phonk Worldwide', amount: 1800, date: '2026-06-05', type: 'Distribution', description: 'Physical pressing and distribution of DIY phonk compilation.' },
  { id: '5', title: 'Workshop Series — Beatmaking in Berlin', amount: 2200, date: '2026-05-28', type: 'Education', description: 'Free community beatmaking workshops for underprivileged youth.' },
];

export default function SovereigntyLedgerPage() {
  const [ssfData, setSsfData] = useState(null);
  const [grants] = useState(MOCK_GRANTS);

  useEffect(() => {
    fetch('/api/ssf/status')
      .then((res) => res.json())
      .then((data) => setSsfData(data))
      .catch(() => {});
  }, []);

  const totalGrants = grants.reduce((s, g) => s + g.amount, 0);
  const poolDisplay = ssfData?.poolAmount || 128470; // fallback mock

  return (
    <div className="min-h-screen text-gray-300 scanlines pt-[100px]">
      <div className="noise" />
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-[-0.03em]">
            Sovereignty <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6b8e23] to-[#4ade80]">Ledger</span>
          </h1>
          <p className="text-xs text-gray-500 max-w-xl mx-auto">
            Every transaction on Top Goats funds the Sovereign Sound Foundation — 
            a non-profit providing IP micro-grants and mental health support for independent artists.
          </p>
        </div>

        {/* SSF Pool Counter */}
        <div className="bg-[#0d0d0d] brutal-border rounded-sm p-8 mb-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6b8e23]/5 to-transparent pointer-events-none" />
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 mb-4">
              Live Sovereign Sound Foundation Pool
            </p>
            <div className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6b8e23] to-[#4ade80] font-mono mb-4 animate-pulse">
              ${(poolDisplay).toLocaleString()}
            </div>
            <p className="text-[10px] text-gray-600">
              Funded by 1.0% of platform fees — automatically transferred to the SSF every month
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-[#0d0d0d] brutal-border rounded-sm p-5 text-center">
            <p className="text-2xl font-black text-white font-mono">{grants.length}</p>
            <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mt-1">Grants Funded</p>
          </div>
          <div className="bg-[#0d0d0d] brutal-border rounded-sm p-5 text-center">
            <p className="text-2xl font-black text-white font-mono">${totalGrants.toLocaleString()}</p>
            <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mt-1">Total Distributed</p>
          </div>
          <div className="bg-[#0d0d0d] brutal-border rounded-sm p-5 text-center">
            <p className="text-2xl font-black text-[#6b8e23] font-mono">1.0%</p>
            <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mt-1">Sovereignty Fee</p>
          </div>
        </div>

        {/* Grant List */}
        <div className="bg-[#0d0d0d] brutal-border rounded-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1a1a1a]">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">Grant History</h2>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {grants.map((grant) => (
              <div key={grant.id} className="px-4 sm:px-6 py-4 hover:bg-[#1a1a1a]/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{grant.title}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{grant.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[9px] font-mono text-gray-600">{grant.date}</span>
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm border border-[#2a2a2a] text-gray-500">
                        {grant.type}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#4ade80] font-mono">${grant.amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SSF Info */}
        <div className="mt-8 bg-[#0d0d0d] brutal-border rounded-sm p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 mb-3">
            About the Sovereign Sound Foundation
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            The SSF is a non-profit organization directly associated with Top Goats. 
            Funded by a 1.0% Sovereignty Fee on platform profits, it provides IP micro-grants 
            and mental health support to underground artists. During Flash Liquidation events, 
            the contribution is doubled to 2.0%.
          </p>
        </div>

      </div>
    </div>
  );
}