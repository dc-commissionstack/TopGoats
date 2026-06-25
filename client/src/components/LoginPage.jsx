import React, { useState } from 'react';

export default function LoginPage({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('tg_token', data.token);
      onLogin(data.user);
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
          <h1 className="text-lg font-bold uppercase tracking-[0.25em] text-white">Sign In</h1>
          <p className="text-xs text-gray-500 mt-2">Access your sovereign artist page</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-sm px-3 py-2 text-sm text-gray-300 focus:border-[#f7971e] outline-none transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-sm px-3 py-2 text-sm text-gray-300 focus:border-[#f7971e] outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-xs text-[#f87171]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 brutal-border text-sm font-bold uppercase tracking-wider transition-all duration-200 hover:bg-[#f7971e] hover:text-black hover:border-[#f7971e] disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          No account?{' '}
          <button onClick={onSwitchToRegister} className="text-[#f7971e] hover:underline">
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}