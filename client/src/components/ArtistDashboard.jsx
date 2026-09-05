import React, { useState, useEffect, useRef } from 'react';
import RankBadge from './RankBadge';
import { redirectToCheckout } from '../lib/checkout';

export default function ArtistDashboard({ user, onLogout, onUpdate }) {
  const [tab, setTab] = useState('tracks'); // 'tracks' | 'profile'
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [profileForm, setProfileForm] = useState({
    display_name: user?.display_name || '',
    handle: user?.handle || '',
    bio: user?.bio || '',
    location: user?.location || '',
    genre: user?.genre || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [buying, setBuying] = useState(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [donationAmount, setDonationAmount] = useState(5);
  const fileInputRef = useRef(null);
  const [trackTitle, setTrackTitle] = useState('');

  // Fetch tracks
  const fetchTracks = () => {
    if (!user?.id) return;
    setLoading(true);
    fetch(`/api/tracks/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setTracks(data.tracks || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTracks();
  }, [user?.id]);

  // Upload track
  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !trackTitle.trim()) {
      setUploadStatus('Please select a file and enter a title.');
      return;
    }
    setUploading(true);
    setUploadStatus('Uploading...');
    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('title', trackTitle.trim());
      const res = await fetch('/api/tracks/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('tg_token')}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUploadStatus(`✅ "${data.track.title}" uploaded!`);
      setTrackTitle('');
      fileInputRef.current.value = '';
      fetchTracks();
    } catch (err) {
      setUploadStatus(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Delete track
  const handleDelete = async (trackId) => {
    if (!confirm('Delete this track?')) return;
    try {
      const res = await fetch(`/api/tracks/${trackId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('tg_token')}` },
      });
      if (res.ok) {
        setTracks(tracks.filter((t) => t.id !== trackId));
      }
    } catch (e) {}
  };

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tg_token')}`,
        },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfileMessage('Profile saved!');
      if (onUpdate) onUpdate(data.user);
    } catch (err) {
      setProfileMessage(`Error: ${err.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '--';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  const handleBuy = async (type, amountCents) => {
    setCheckoutError('');
    setBuying(type);
    try {
      await redirectToCheckout(type, amountCents ? { amountCents } : {});
    } catch (err) {
      setCheckoutError(err.message);
      setBuying(null);
    }
  };

  const handleDonate = () => {
    const dollars = Number(donationAmount);
    if (!Number.isFinite(dollars) || dollars < 1) {
      setCheckoutError('Please enter an amount of at least $1.');
      return;
    }
    handleBuy('donation', Math.round(dollars * 100));
  };

  return (
    <div className="min-h-screen text-gray-300 scanlines pt-[100px]">
      <div className="noise" />
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-sm bg-gradient-to-br from-[#f7971e]/20 to-[#0a0a0a] flex items-center justify-center border border-[#2a2a2a]">
              <span className="text-2xl">🎵</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{user?.display_name || 'Artist'}</h1>
              <p className="text-[10px] text-gray-500">{user?.handle}</p>
            </div>
          </div>
          <RankBadge xp={user?.xp || 0} />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 border-b border-[#1a1a1a]">
          <button
            onClick={() => setTab('tracks')}
            className={`px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
              tab === 'tracks' ? 'text-[#f7971e] border-b-2 border-[#f7971e]' : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            🎵 Tracks
          </button>
          <button
            onClick={() => setTab('profile')}
            className={`px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
              tab === 'profile' ? 'text-[#f7971e] border-b-2 border-[#f7971e]' : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            ⚙️ Profile
          </button>
          <button
            onClick={onLogout}
            className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 hover:text-[#f87171] transition-all ml-auto"
          >
            Sign Out
          </button>
        </div>

        {/* ===== TRACKS TAB ===== */}
        {tab === 'tracks' && (
          <>
            {/* Upload Section */}
            <div className="bg-[#0d0d0d] brutal-border rounded-sm p-6 mb-8">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 mb-4">Upload New Track</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                  placeholder="Track title"
                  className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-sm px-3 py-2 text-sm text-gray-300 focus:border-[#f7971e] outline-none"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,.wav,.flac,.aac,.ogg,.m4a"
                  className="text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-bold file:bg-[#1a1a1a] file:text-gray-300 hover:file:bg-[#2a2a2a]"
                />
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-6 py-2 bg-[#f7971e] text-black text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-[#ffd200] transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {uploadStatus && (
                <p className={`text-[10px] mt-3 ${uploadStatus.startsWith('✅') ? 'text-[#4ade80]' : uploadStatus.startsWith('Error') ? 'text-[#f87171]' : 'text-gray-500'}`}>
                  {uploadStatus}
                </p>
              )}
            </div>

            {/* Track Grid */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] animate-pulse">Loading tracks...</p>
              </div>
            ) : tracks.length === 0 ? (
              <div className="bg-[#0d0d0d] brutal-border rounded-sm p-12 text-center">
                <p className="text-sm text-gray-500 mb-2">No tracks yet</p>
                <p className="text-[10px] text-gray-700">Upload your first track above to start building your catalog.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tracks.map((track) => (
                  <div key={track.id} className="group bg-[#0d0d0d] brutal-border rounded-sm overflow-hidden hover:border-[#f7971e]/30 transition-all duration-300">
                    {/* Album art placeholder */}
                    <div className="aspect-square bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center relative">
                      <span className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity">🎵</span>
                      <button
                        onClick={() => handleDelete(track.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-[#f87171]/80 rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#f87171]"
                      >
                        <span className="text-[10px] text-white font-bold">✕</span>
                      </button>
                    </div>
                    {/* Track info */}
                    <div className="p-4">
                      <p className="text-sm font-bold text-white truncate">{track.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-600">
                        <span>{track.plays || 0} plays</span>
                        <span>{formatSize(track.file_size)}</span>
                        <span className="text-[9px] font-mono">{track.created_at?.split(' ')[0] || ''}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== PROFILE TAB ===== */}
        {tab === 'profile' && (
          <div className="max-w-2xl">
            <form onSubmit={handleSaveProfile} className="bg-[#0d0d0d] brutal-border rounded-sm p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block mb-1">Display Name</label>
                  <input type="text" value={profileForm.display_name}
                    onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-sm px-3 py-2 text-sm text-gray-300 focus:border-[#f7971e] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block mb-1">Handle</label>
                  <input type="text" value={profileForm.handle}
                    onChange={(e) => setProfileForm({ ...profileForm, handle: e.target.value })}
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-sm px-3 py-2 text-sm text-gray-300 focus:border-[#f7971e] outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block mb-1">Bio</label>
                <textarea value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={4}
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-sm px-3 py-2 text-sm text-gray-300 focus:border-[#f7971e] outline-none resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block mb-1">Location</label>
                  <input type="text" value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-sm px-3 py-2 text-sm text-gray-300 focus:border-[#f7971e] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block mb-1">Genre</label>
                  <input type="text" value={profileForm.genre}
                    onChange={(e) => setProfileForm({ ...profileForm, genre: e.target.value })}
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-sm px-3 py-2 text-sm text-gray-300 focus:border-[#f7971e] outline-none" />
                </div>
              </div>

              {profileMessage && (
                <p className={`text-xs ${profileMessage.startsWith('Error') ? 'text-[#f87171]' : 'text-[#4ade80]'}`}>
                  {profileMessage}
                </p>
              )}

              <button type="submit" disabled={savingProfile}
                className="px-6 py-2.5 bg-[#f7971e] text-black text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-[#ffd200] transition-colors disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        )}

        {/* Support & Memberships — server-driven Stripe Checkout */}
        <div className="mt-8 bg-[#0d0d0d] brutal-border rounded-sm p-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 mb-4">Support &amp; Memberships</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleBuy('premium')}
              disabled={buying === 'premium'}
              className="block text-center py-4 brutal-border text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:border-[#f7971e] hover:text-[#f7971e] transition-all disabled:opacity-50"
            >
              Premium Membership<br /><span className="text-sm font-black">$9.99/mo</span>
            </button>
            <button
              onClick={() => handleBuy('copyright_filing')}
              disabled={buying === 'copyright_filing'}
              className="block text-center py-4 brutal-border text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:border-[#6b8e23] hover:text-[#6b8e23] transition-all disabled:opacity-50"
            >
              Copyright Filing<br /><span className="text-sm font-black">$50</span>
            </button>
            <div className="brutal-border py-3 px-4 flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                Sovereignty Donation
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black">$</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="w-16 bg-[#111] border border-[#2a2a2a] rounded-sm px-2 py-1 text-sm text-white text-center focus:border-[#4ade80] outline-none"
                />
              </div>
              <button
                onClick={handleDonate}
                disabled={buying === 'donation'}
                className="w-full text-center py-2 brutal-border text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:border-[#4ade80] hover:text-[#4ade80] transition-all disabled:opacity-50"
              >
                Donate
              </button>
            </div>
          </div>
          {checkoutError && (
            <p className="text-[10px] text-[#f87171] mt-3">{checkoutError}</p>
          )}
        </div>
      </div>
    </div>
  );
}