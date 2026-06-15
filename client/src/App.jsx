import React from 'react';
import ArtistPage from './components/ArtistPage';

function App() {
  return (
    <>
      {/* Brand background image */}
      <div id="brand-bg">
        <img src="/top-goats-bg.jpg" alt="" aria-hidden="true" />
      </div>

      {/* Site header with logo */}
      <header className="site-header">
        <div className="flex items-center gap-3">
          <img
            src="/top-goats-logo.jpg"
            alt="Top Goats"
            className="site-logo"
          />
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/70 hidden sm:block">
            Top Goats
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <a href="/" className="text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-[#f7971e] transition-colors">
            Explore
          </a>
          <a href="/api/herd/tiers" className="text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-[#f7971e] transition-colors">
            The Herd
          </a>
          <a href="/api/herd/leaderboard" className="text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-[#f7971e] transition-colors">
            Leaderboard
          </a>
        </nav>
      </header>

      {/* Main content — artist sovereign page */}
      <ArtistPage />
    </>
  );
}

export default App;