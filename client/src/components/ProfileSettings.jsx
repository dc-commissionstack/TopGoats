import React, { useState } from 'react';
import RankBadge from './RankBadge';

export default function ProfileSettings({ user, onUpdate, onLogout }) {
  const [form, setForm] = useState({
    display_name: user.display_name || '',
    handle: user.handle || '',
    bio: user.bio || '',
    location: user.location || '',
    genre: user.genre || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tg_token')}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage('Profile saved!');
      onUpdate(data.user);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen scanlines pt-[100px]">
      <div className="noise" />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-[0.1em]">Settings</h1>
            <p className="text-xs text-gray-500 mt-1">Manage your sovereign artist profile</p>
          </div>
          <RankBadge xp={user.xp || 0} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-[#0d0d0d] brutal-border rounded-sm p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block mb-1">Display Name</label>
                  <input type="text" name="display_name" value={form.display_name} onChange={handleChange}
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-sm px-3 py-2 text-sm text-gray-300 focus:border-[#f7971e] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block mb-1">Handle</label>
                  <input type="text" name="handle" value={form.handle} onChange={handleChange}
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-sm px-3 py-2 text-sm text-gray-300 focus:border-[#f7971e] outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block mb-1">Bio</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows={4}
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-sm px-3 py-2 text-sm text-gray-300 focus:border-[#f7971e] outline-none resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block mb-1">Location</label>
                  <input type="text" name="location" value={form.location} onChange={handleChange}
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-sm px-3 py-2 text-sm text-gray-300 focus:border-[#f7971e] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block mb-1">Genre</label>
                  <input type="text" name="genre" value={form.genre} onChange={handleChange}
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-sm px-3 py-2 text-sm text-gray-300 focus:border-[#f7971e] outline-none" />
                </div>
              </div>

              {message && (
                <p className={`text-xs ${message.startsWith('Error') ? 'text-[#f87171]' : 'text-[#4ade80]'}`}>
                  {message}
                </p>
              )}

              <button type="submit" disabled={saving}
                className="px-6 py-2.5 brutal-border text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:bg-[#f7971e] hover:text-black hover:border-[#f7971e] disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-[#0d0d0d] brutal-border rounded-sm p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 mb-3">Account</h3>
              <p className="text-xs text-gray-400">{user.email}</p>
              <p className="text-[10px] text-gray-600 mt-1">ID: {user.id}</p>
              <p className="text-[10px] text-gray-600">Joined: {user.joined || 'Today'}</p>
            </div>

            <div className="bg-[#0d0d0d] brutal-border rounded-sm p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 mb-3">Danger Zone</h3>
              <p className="text-[10px] text-gray-600 mb-3">Sign out of your account.</p>
              <button onClick={onLogout}
                className="w-full py-2 border border-[#f87171]/30 text-xs uppercase tracking-wider text-[#f87171] hover:bg-[#f87171]/10 transition-colors rounded-sm">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}