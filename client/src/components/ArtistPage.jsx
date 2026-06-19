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
    <div className="min-h-screen text-gray-300 scanlines pt-14">
      <div className="noise" />

      {/* Hero Section */}
      <header className="relative border-b border-[#1a1a1a]">
        {/* Hero background - pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(45deg, #fff 25%, transparent 25%),
                linear-gradient(-45deg, #fff 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #fff 75%),
                linear-gradient(-45deg, transparent 75%, #fff 75%)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-24">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Artist Avatar */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 brutal-border rounded-sm flex-shrink-0 bg-gradient-to-br from-[#f7971e]/20 to-[#0a0a0a] flex items-center justify-center">
              <span className="text-5xl sm:text-6xl opacity-80">🎵</span>
            </div>

            {/* Artist Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-5xl font-black tracking-[-0.03em] leading-none mb-3 text-white"
                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.03em' }}
              >
                {artist.name}
              </h1>
              <p className="text-sm text-gray-500 font-mono mb-2">{artist.handle}</p>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <RankBadge xp={artist.xp} size="lg" />
                <span className="text-[10px] text-gray-600 uppercase tracking-wider border border-[#2a2a2a] px-2 py-1 rounded-sm">
                  {artist.genre}
                </span>
                <span className="text-[10px] text-gray-600">📍 {artist.location}</span>
              </div>

              {/* Stats */}
              <div className="flex gap-4 text-xs">
                <div className="border border-[#2a2a2a] px-3 py-1.5 rounded-sm">
                  <p className="text-white font-bold">{artist.tracks.length}</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider">Tracks</p>
                </div>
                <div className="border border-[#2a2a2a] px-3 py-1.5 rounded-sm">
                  <p className="text-white font-bold">{artist.tracks.reduce((s, t) => s + t.plays, 0).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider">Total Plays</p>
                </div>
                <div className="border border-[#2a2a2a] px-3 py-1.5 rounded-sm">
                  <p className="text-white font-bold">{artist.joined}</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider">Joined</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Three Goats — Hero Graphic */}
      <section className="relative overflow-hidden border-b border-[#1a1a1a]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-20 flex items-center justify-center">
          <img
            src="/three-goats.png"
            alt="Top Goats"
            className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl h-auto opacity-40 sm:opacity-50 hover:opacity-60 transition-opacity duration-700 select-none pointer-events-none"
            style={{
              filter: 'grayscale(1) contrast(1.2)',
              mixBlendMode: 'screen',
            }}
          />
        </div>
        {/* Overlay text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] text-white/10 sm:text-white/[0.08]">
              Sovereign Sound • Independent • Underground
            </p>
          </div>
        </div>
      </section>
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Music Player */}
          <div className="lg:col-span-2">
            <MusicPlayer tracks={liveTracks || artist.tracks} userId={user?.id} />
          </div>

          {/* Right Column: Bio & Actions */}
          <div className="space-y-6">
            {/* Biography */}
            <section className="bg-[#111] brutal-border rounded-sm p-5">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 mb-3">
                Biography
              </h2>
              <div className="space-y-3">
                {artist.bio.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-xs leading-relaxed text-gray-400">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            {/* Buy All / Support */}
            <section className="bg-[#111] brutal-border rounded-sm p-5">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 mb-3">
                Support the Artist
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Direct support keeps the underground alive. No label taking a cut.
              </p>
              <div className="space-y-3">
                <button
                  className="w-full py-3 brutal-border text-sm font-bold uppercase tracking-wider transition-all duration-200 hover:bg-[#f7971e] hover:text-black hover:border-[#f7971e]"
                  onClick={() => alert('Stripe payment flow — coming soon!')}
                >
                  💰 Buy All Tracks — $7.00
                </button>
                <button
                  className="w-full py-2.5 border border-[#2a2a2a] text-xs uppercase tracking-wider text-gray-400 hover:border-[#666] transition-colors rounded-sm"
                  onClick={() => alert('Stripe payment flow — coming soon!')}
                >
                  🎵 Buy Individual Track
                </button>
                <button
                  className="w-full py-2.5 border border-[#2a2a2a] text-xs uppercase tracking-wider text-gray-400 hover:border-[#666] transition-colors rounded-sm"
                  onClick={() => alert('Tip/membership flow — coming soon!')}
                >
                  ⚡ Tip Artist
                </button>
              </div>
            </section>

            {/* Social Links */}
            <section className="bg-[#111] brutal-border rounded-sm p-5">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 mb-3">
                Connect
              </h2>
              <div className="flex flex-wrap gap-2">
                {artist.socialLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    className="text-[11px] px-3 py-1.5 border border-[#2a2a2a] rounded-sm hover:border-[#f7971e] hover:text-[#f7971e] transition-colors uppercase tracking-wider"
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            </section>

            {/* Copyright Protection Badge */}
            <section className="bg-[#111] brutal-border rounded-sm p-5 border-[#6b8e23]/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#6b8e23] text-sm">✓</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b8e23]">
                  Sovereign Artist
                </span>
              </div>
              <p className="text-[10px] text-gray-600 leading-relaxed">
                All tracks protected by automated copyright fingerprinting. 
                Top Goats secures your IP at the point of upload.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-8 mt-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.3em]">
            Powered by <span className="text-gray-500">Top Goats</span> — Independent Music Ecosystem
          </p>
          <p className="text-[10px] text-gray-800 mt-2">
            This page is an artist sovereign template. All content belongs to the artist.
          </p>
        </div>
      </footer>
    </div>
  );
}