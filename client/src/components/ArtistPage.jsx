import React, { useState, useEffect } from 'react';
import RankBadge from './RankBadge';
import MusicPlayer from './MusicPlayer';

// Mock artist data for the template
const MOCK_ARTIST = {
  id: 'vex-echo',
  name: 'V•E•X   E•C•H•O',
  handle: '@vex_echo',
  xp: 342,
  bio: `Underground producer based in Berlin. Glitch-hop / experimental bass music. 
Releasing independently since 2022. No label. No masters. No compromises.

"Sound is the only currency that matters."`,
  location: 'Berlin, DE',
  genre: 'Glitch-Hop / Experimental Bass',
  joined: '2022',
  tracks: [
    { id: '1', title: 'Neon Frequencies', duration: '3:45', plays: 1284 },
    { id: '2', title: 'Data Stream', duration: '4:12', plays: 892 },
    { id: '3', title: 'Signal Lost', duration: '2:58', plays: 567 },
    { id: '4', title: 'Concrete Waves', duration: '5:01', plays: 2341 },
    { id: '5', title: 'Zero Hour', duration: '3:33', plays: 445 },
  ],
  socialLinks: [
    { platform: 'Instagram', url: '#' },
    { platform: 'SoundCloud', url: '#' },
    { platform: 'YouTube', url: '#' },
  ],
};

export default function ArtistPage({ user }) {
  const [liveTracks, setLiveTracks] = useState(null);

  // Fetch live data if user is logged in
  const liveArtist = user
    ? {
        id: user.id,
        name: user.display_name || user.handle,
        handle: `@${user.handle}`,
        xp: user.xp || 0,
        bio: user.bio || 'Independent artist. No label. No compromises.',
        location: user.location || '',
        genre: user.genre || 'Underground',
        joined: user.joined || 'Today',
        tracks: MOCK_ARTIST.tracks,
        socialLinks: MOCK_ARTIST.socialLinks,
      }
    : null;

  const artist = liveArtist || MOCK_ARTIST;

  // Fetch real tracks from API if user is logged in
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/tracks/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.tracks && data.tracks.length > 0) {
            setLiveTracks(data.tracks.map((t) => ({
              id: t.id,
              title: t.title,
              duration: t.duration || '--:--',
              plays: t.plays || 0,
              filePath: t.file_path,
            })));
          }
        })
        .catch(() => {});
    }
  }, [user?.id]);

  return (
    <div className="min-h-screen text-gray-300 scanlines pt-[160px] bg-transparent">
      <div className="noise" />

      {/* Hero Section */}
      <header className="relative border-b border-white/5 overflow-hidden animate-fade-in">
        <div className="relative max-w-6xl mx-auto px-6 py-12 sm:py-24 z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            {/* Artist Avatar - Interactive with Glow */}
            <div className="group relative w-32 h-32 sm:w-48 sm:h-48 flex-shrink-0 animate-scale-in">
              <div className="absolute inset-0 bg-[#f7971e]/20 rounded-sm blur-2xl group-hover:bg-[#f7971e]/40 transition-all duration-500" />
              <div className="relative w-full h-full brutal-border bg-black flex items-center justify-center overflow-hidden">
                <span className="text-6xl sm:text-8xl group-hover:scale-110 transition-transform duration-500">🎵</span>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#f7971e] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            </div>

            {/* Artist Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block px-3 py-1 bg-[#f7971e]/10 brutal-border border-[#f7971e]/30 text-[#f7971e] text-[10px] font-bold uppercase tracking-widest mb-6 animate-fade-in-right">
                Sovereign Artist
              </div>
              <h1 className="text-5xl sm:text-7xl font-black text-white leading-none mb-4 tracking-tighter uppercase animate-fade-in-up">
                {artist.name}
              </h1>
              <p className="text-lg text-gray-500 font-mono mb-8 opacity-70">{artist.handle}</p>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mb-8">
                <RankBadge xp={artist.xp} size="lg" />
                <div className="h-1 w-1 rounded-full bg-gray-700 hidden sm:block" />
                <span className="text-xs text-gray-400 uppercase tracking-widest border border-white/10 px-4 py-2 bg-white/5 rounded-sm">
                  {artist.genre}
                </span>
                {/* Founding Goat badge */}
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 border border-[#6b8e23]/40 text-[#6b8e23] bg-[#6b8e23]/5 rounded-sm">
                  👑 Founding Goat
                </span>
                {/* Sovereignty Shield badge */}
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 border border-[#4ade80]/30 text-[#4ade80] bg-[#4ade80]/5 rounded-sm">
                  🛡️ IP Shield
                </span>
                <span className="text-xs text-gray-500 font-medium">📍 {artist.location}</span>
              </div>

              {/* Enhanced Stats Row */}
              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto md:mx-0">
                {[
                  { val: artist.tracks.length, label: 'Tracks' },
                  { val: artist.tracks.reduce((s, t) => s + t.plays, 0).toLocaleString(), label: 'Plays' },
                  { val: artist.joined, label: 'Joined' }
                ].map((stat, i) => (
                  <div key={i} className="bg-[#0d0d0d] brutal-border p-3 group hover:border-[#f7971e]/50 transition-colors">
                    <p className="text-xl font-black text-white group-hover:text-[#f7971e] transition-colors">{stat.val}</p>
                    <p className="text-[9px] text-gray-600 uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Music Player */}
          <div className="lg:col-span-2 space-y-12">
            <MusicPlayer tracks={liveTracks || artist.tracks} userId={user?.id} />
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-8">
            {/* Action Card - Support */}
            <section className="bg-[#0d0d0d] brutal-border p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#f7971e]/5 -mr-12 -mt-12 rounded-full blur-3xl group-hover:bg-[#f7971e]/10 transition-all" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white mb-6 border-b border-white/5 pb-4">
                Support the Sound
              </h2>
              <div className="space-y-4">
                <button
                  className="w-full py-4 bg-[#f7971e] text-black text-xs font-black uppercase tracking-widest hover:bg-[#ffd200] active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(247,151,30,0.2)]"
                  onClick={() => alert('Commerce flow coming soon!')}
                >
                  Buy Entire Catalog — $7.00
                </button>
                <div className="grid grid-cols-2 gap-3">
                   <button className="py-3 brutal-border text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 transition-all text-gray-400">
                     Tip Artist
                   </button>
                   <button className="py-3 brutal-border text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 transition-all text-gray-400">
                     Share Hub
                   </button>
                </div>
              </div>
            </section>

            {/* Biography Section */}
            <section className="bg-[#0d0d0d] brutal-border p-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6">
                Chronicle
              </h2>
              <div className="space-y-4">
                {artist.bio.split('\\n\\n').map((paragraph, i) => (
                  <p key={i} className="text-[13px] leading-relaxed text-gray-400 font-medium">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            {/* IP Verification - Visual Highlight */}
            <section className="bg-black brutal-border p-6 border-[#6b8e23]/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#6b8e23] animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6b8e23]">
                  IP Authenticated
                </span>
              </div>
              <p className="text-[10px] text-gray-600 leading-relaxed font-mono">
                Verified on Top Goats Ledger. No unauth sampling detected. Sovereignty status: ACTIVE.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Simplified Bottom Nav / Footer */}
      <footer className="py-20 border-t border-white/5 opacity-30 text-center">
        <p className="text-[9px] uppercase tracking-[0.5em] text-gray-500">
          Top Goats Sovereign Artist Page • ID: {artist.id.toUpperCase()}
        </p>
      </footer>
    </div>
  );
}
