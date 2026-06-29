import React, { useState, useRef } from 'react';

// Mock tracks for template display
const DEFAULT_TRACKS = [
  { id: '1', title: 'Underground Hymn', duration: '3:45', plays: 1284 },
  { id: '2', title: 'Concrete Jungle', duration: '4:12', plays: 892 },
  { id: '3', title: 'Lost Signals', duration: '2:58', plays: 567 },
  { id: '4', title: 'Midnight Run', duration: '5:01', plays: 2341 },
  { id: '5', title: 'Raw Edge', duration: '3:33', plays: 445 },
];

export default function MusicPlayer({ tracks = DEFAULT_TRACKS }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handlePlay = (track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#111] brutal-border rounded-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a] bg-[#0d0d0d]">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
          Discography
        </h3>
        <span className="text-[10px] text-gray-600">{tracks.length} tracks</span>
      </div>

      {/* Track List */}
      <div className="divide-y divide-[#1a1a1a]">
        {tracks.map((track, i) => (
          <div
            key={track.id}
            className={`flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-[#1a1a1a] group ${
              currentTrack?.id === track.id ? 'bg-[#1a1a1a]' : ''
            }`}
            onClick={() => handlePlay(track)}
          >
            {/* Play button */}
            <button
              className="w-8 h-8 flex items-center justify-center border border-[#333] rounded-sm hover:border-[#f7971e] transition-colors flex-shrink-0"
              onClick={(e) => { e.stopPropagation(); handlePlay(track); }}
            >
              {currentTrack?.id === track.id && isPlaying ? (
                <span className="text-[10px] text-[#f7971e] font-mono">❚❚</span>
              ) : (
                <span className="text-xs text-gray-400 group-hover:text-[#f7971e]">▶</span>
              )}
            </button>

            {/* Track number */}
            <span className="text-[10px] text-gray-600 w-4 font-mono">{i + 1}</span>

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${
                currentTrack?.id === track.id ? 'text-[#f7971e]' : 'text-gray-300'
              }`}>
                {track.title}
              </p>
              <p className="text-[10px] text-gray-600">{track.plays.toLocaleString()} plays</p>
            </div>

            {/* Duration */}
            <span className="text-xs text-gray-500 font-mono">{track.duration}</span>

            {/* Buy button with mock checkout */}
            <button
              className="text-[10px] px-3 py-1 border border-[#333] rounded-sm uppercase tracking-wider hover:border-[#f7971e] hover:text-[#f7971e] transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                alert('Stripe checkout — coming soon!\n\nMock: Track purchased. SSF contribution recorded.');
              }}
            >
              Buy
            </button>
          </div>
        ))}
      </div>

      {/* Now playing mini-bar */}
      {currentTrack && (
        <div className="px-4 py-2 border-t border-[#2a2a2a] bg-[#0d0d0d] flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Now Playing:</span>
            <span className="text-xs text-[#f7971e] truncate">{currentTrack.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-[2px]">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`w-[2px] bg-[#f7971e] animate-pulse`}
                  style={{
                    height: `${4 + bar * 3}px`,
                    animationDelay: `${bar * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}