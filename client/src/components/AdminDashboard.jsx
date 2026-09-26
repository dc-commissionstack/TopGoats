import React, { useState, useEffect } from 'react';

function StatCard({ label, value }) {
  return (
    <div className="bg-[#0d0d0d] brutal-border rounded-sm p-5 text-center">
      <p className="text-2xl font-black text-white font-mono">{value}</p>
      <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mt-1">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tg_token');
    if (!token) {
      setError('Admin access required');
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const fetchJson = (url) =>
      fetch(url, { headers })
        .then((res) => {
          if (res.status === 401 || res.status === 403) {
            throw new Error('Admin access required');
          }
          return res.json().then((data) => {
            if (!res.ok) throw new Error(data.error || 'Request failed');
            return data;
          });
        });

    Promise.all([
      fetchJson('/api/admin/stats'),
      fetchJson('/api/admin/users'),
      fetchJson('/api/admin/orders'),
    ])
      .then(([statsData, usersData, ordersData]) => {
        setStats(statsData);
        setUsers(usersData.users || []);
        setOrders(ordersData.orders || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const gmvDollars = stats ? (stats.gmvCents / 100).toFixed(2) : '0.00';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center scanlines pt-[100px]">
        <div className="noise" />
        <p className="text-xs text-gray-600 uppercase tracking-[0.2em]">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center scanlines pt-[100px]">
        <div className="noise" />
        <div className="bg-[#0d0d0d] brutal-border rounded-sm p-8 text-center">
          <p className="text-sm text-[#f87171]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-300 scanlines pt-[100px]">
      <div className="noise" />
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-[-0.03em]">
            Admin <span className="text-[#f7971e]">Console</span>
          </h1>
          <p className="text-xs text-gray-500 mt-2">Top Goats platform overview</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          <StatCard label="Users" value={stats.totalUsers} />
          <StatCard label="Artists" value={stats.totalArtists} />
          <StatCard label="Tracks" value={stats.totalTracks} />
          <StatCard label="Orders" value={stats.totalOrders} />
          <StatCard label="GMV" value={'$' + gmvDollars} />
          <StatCard label="Premium" value={stats.premiumCount} />
        </div>

        {/* Users table */}
        <div className="bg-[#0d0d0d] brutal-border rounded-sm overflow-hidden mb-10">
          <div className="px-6 py-4 border-b border-[#1a1a1a]">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-gray-600 border-b border-[#1a1a1a]">
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Handle</th>
                  <th className="px-6 py-3">Display Name</th>
                  <th className="px-6 py-3">XP</th>
                  <th className="px-6 py-3">Admin</th>
                  <th className="px-6 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-xs text-gray-600">No users yet.</td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <tr key={i} className="text-xs hover:bg-[#1a1a1a]/50 transition-colors">
                      <td className="px-6 py-3 text-gray-300">{u.email || '—'}</td>
                      <td className="px-6 py-3 text-gray-400">@{u.handle || '—'}</td>
                      <td className="px-6 py-3 text-gray-300">{u.display_name || '—'}</td>
                      <td className="px-6 py-3 text-gray-400 font-mono">{u.xp || 0}</td>
                      <td className="px-6 py-3">
                        {u.is_admin ? (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 border border-[#f7971e]/40 text-[#f7971e] rounded-sm">Admin</span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-gray-600 font-mono text-[10px]">
                        {u.created_at ? u.created_at.slice(0, 10) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders table */}
        <div className="bg-[#0d0d0d] brutal-border rounded-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1a1a1a]">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-gray-600 border-b border-[#1a1a1a]">
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-xs text-gray-600">No orders yet.</td>
                  </tr>
                ) : (
                  orders.map((o, i) => (
                    <tr key={i} className="text-xs hover:bg-[#1a1a1a]/50 transition-colors">
                      <td className="px-6 py-3 text-gray-300 uppercase tracking-wide text-[10px]">{o.type}</td>
                      <td className="px-6 py-3 text-gray-400 font-mono">
                        ${((o.amount_total || 0) / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 border border-[#4ade80]/30 text-[#4ade80] rounded-sm">
                          {o.status || 'paid'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600 font-mono text-[10px]">
                        {o.created_at ? o.created_at.slice(0, 19) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
