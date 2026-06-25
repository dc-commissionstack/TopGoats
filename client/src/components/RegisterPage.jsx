import React, { useState } from 'react';

export default function RegisterPage({ onRegister, onSwitchToLogin }) {
  const [form, setForm] = useState({ email: '', password: '', handle: '', displayName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('tg_token', data.token);
      onRegister(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 scanlines pt-[100px]">
      <div className="noise" />
      <div className="w-full max-w-md bg-[#0d0d0d] brutal-border rounded-sm p-8">
        <div className="text-center mb-8">
          <img src="/top-goats-logo.jpg" alt="Top Goats" className="h-8 mx-auto mb-4 opacity-80" />
          <h1 className="text-lg font-bold uppercase tracking-[0.25em] text-white">Join the Herd</h1>
          <p className="text-xs text-gray-500 mt-2">Create your sovereign artist page</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-sm px-3 py-2 text-sm text-gray-300 focus:border-[#f7971e] outline-none transition-colors"
              placeholder="you@example.com" required />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block mb-1">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-sm px-3 py-2 text-sm text-gray-300 focus:border-[#f7971e] outline-none transition-colors"
              placeholder="Min 6 characters" required minLength={6} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block mb-1">Artist Handle</label>
            <input type="text" name="handle" value={form.handle} onChange={handleChange}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-sm px-3 py-2 text-sm text-gray-300 focus:border-[#f7971e] outline-none transition-colors"
              placeholder="@yourhandle" required />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block mb-1">Display Name</label>
            <input type="text" name="displayName" value={form.displayName} onChange={handleChange}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-sm px-3 py-2 text-sm text-gray-300 focus:border-[#f7971e] outline-none transition-colors"
              placeholder="Your Artist Name" required />
          </div>

          {error && <p className="text-xs text-[#f87171]">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 brutal-border text-sm font-bold uppercase tracking-wider transition-all duration-200 hover:bg-[#f7971e] hover:text-black hover:border-[#f7971e] disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Join the Herd'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          Already a member?{' '}
          <button onClick={onSwitchToLogin} className="text-[#f7971e] hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}