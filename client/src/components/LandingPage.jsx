import React from 'react';

export default function LandingPage({ onExplore, onJoin }) {
  return (
    <div className="min-h-screen text-gray-300 scanlines pt-14">
      <div className="noise" />

      {/* Full-screen hero section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#050505]" />

        {/* Three goats — massive focal graphic */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-full max-w-5xl mx-auto px-4">
            <img
              src="/three-goats.png"
              alt="Top Goats"
              className="w-full h-auto opacity-25 sm:opacity-30 md:opacity-35 select-none"
              style={{
                filter: 'grayscale(1) contrast(1.3) brightness(1.1)',
                mixBlendMode: 'screen',
              }}
            />
          </div>
        </div>

        {/* Scanline over image */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }} />

        {/* Content overlay */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Tagline */}
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.5em] text-[#f7971e] mb-6">
            Sovereign Ecosystem for Off-Label Artists
          </p>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.95] mb-6 tracking-[-0.03em]">
            Own Your Sound.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f7971e] to-[#ffd200]">
              No Gatekeepers.
            </span>
          </h1>

          {/* Value proposition */}
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop asking for permission. Start owning your IP. 
            Top Goats gives independent artists a sovereign platform 
            to host, distribute, and protect their music — 
            with automated copyright fingerprinting, direct-to-fan sales, 
            and zero major label interference.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onJoin}
              className="w-full sm:w-auto px-8 py-4 bg-[#f7971e] text-black text-sm font-black uppercase tracking-[0.2em] rounded-sm hover:bg-[#ffd200] transition-all duration-200 shadow-lg shadow-[#f7971e]/20"
            >
              Join the Herd
            </button>
            <button
              onClick={onExplore}
              className="w-full sm:w-auto px-8 py-4 border-2 border-[#2a2a2a] text-sm font-bold uppercase tracking-[0.2em] rounded-sm hover:border-[#f7971e] hover:text-[#f7971e] transition-all duration-200"
            >
              Explore Artists
            </button>
          </div>

          {/* Brand assurance */}
          <div className="mt-16 flex items-center justify-center gap-6 text-[10px] text-gray-700 uppercase tracking-[0.2em]">
            <span>No Labels</span>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <span>No Masters</span>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <span>Full Sovereignty</span>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
      </section>

      {/* Features / Pitch Section */}
      <section className="py-20 border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
              Built for the Underground
            </h2>
            <p className="text-xs text-gray-500 max-w-xl mx-auto">
              Everything you need to distribute, protect, and monetize your music — without giving up your rights.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#0d0d0d] brutal-border rounded-sm p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-sm bg-[#1a1a1a] flex items-center justify-center border border-[#2a2a2a]">
                <span className="text-lg">🎵</span>
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-[0.1em] mb-2">Sovereign Pages</h3>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Your own artist webpage. Set your prices. Keep your revenue. No middlemen.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#0d0d0d] brutal-border rounded-sm p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-sm bg-[#1a1a1a] flex items-center justify-center border border-[#2a2a2a]">
                <span className="text-lg">🛡️</span>
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-[0.1em] mb-2">IP Protection</h3>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Automated copyright fingerprinting at upload. Your sound stays yours.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#0d0d0d] brutal-border rounded-sm p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-sm bg-[#1a1a1a] flex items-center justify-center border border-[#2a2a2a]">
                <span className="text-lg">🏔️</span>
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-[0.1em] mb-2">The Herd</h3>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Rise through 5 tiers. Unlock lower fees, features, and VIP support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-[#1a1a1a] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-600 mb-4">
            The first 100 artists get Premium for Life
          </p>
          <button
            onClick={onJoin}
            className="px-10 py-4 bg-[#f7971e] text-black text-sm font-black uppercase tracking-[0.2em] rounded-sm hover:bg-[#ffd200] transition-all duration-200"
          >
            Join the Herd — Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.3em]">
            <span className="text-gray-500">Top Goats</span> — Independent Music Ecosystem
          </p>
          <p className="text-[10px] text-gray-800 mt-2">
            Stop asking for permission. Start owning your IP.
          </p>
        </div>
      </footer>
    </div>
  );
}