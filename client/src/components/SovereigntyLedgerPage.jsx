import React, { useState, useEffect } from 'react';
import { redirectToCheckout } from '../lib/checkout';

const MOCK_GRANTS = []; // No grants yet — funded by real platform fees

export default function SovereigntyLedgerPage() {
  const [ssfData, setSsfData] = useState(null);
  const [grants] = useState(MOCK_GRANTS);
  const [buying, setBuying] = useState(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [donationAmount, setDonationAmount] = useState(5);

  useEffect(() => {
    fetch('/api/ssf/status')
      .then((res) => res.json())
      .then((data) => setSsfData(data))
      .catch(() => {});
  }, []);

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

  const totalGrants = grants.reduce((s, g) => s + g.amount, 0);
  const poolDisplay = ssfData?.poolAmount ?? 0; // real value, fallback to 0

  return (
    <div className="min-h-screen text-gray-300 scanlines pt-[100px]">
      <div className="noise" />
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-[-0.03em]">
            Sovereignty <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6b8e23] to-[#4ade80]">Ledger</span>
          </h1>
          <p className="text-xs text-gray-500 max-w-xl mx-auto">
            Every transaction on Top Goats funds the Sovereign Sound Foundation — 
            a non-profit providing IP micro-grants and mental health support for independent artists.
          </p>
        </div>

        {/* SSF Pool Counter */}
        <div className="bg-[#0d0d0d] brutal-border rounded-sm p-8 mb-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6b8e23]/5 to-transparent pointer-events-none" />
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 mb-4">
              Live Sovereign Sound Foundation Pool
            </p>
            <div className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6b8e23] to-[#4ade80] font-mono mb-4 animate-pulse">
              ${(poolDisplay).toLocaleString()}
            </div>
            <p className="text-[10px] text-gray-600">
              Funded by 1.0% of platform fees — automatically transferred to the SSF every month
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-[#0d0d0d] brutal-border rounded-sm p-5 text-center">
            <p className="text-2xl font-black text-white font-mono">{grants.length}</p>
            <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mt-1">Grants Funded</p>
          </div>
          <div className="bg-[#0d0d0d] brutal-border rounded-sm p-5 text-center">
            <p className="text-2xl font-black text-white font-mono">${totalGrants.toLocaleString()}</p>
            <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mt-1">Total Distributed</p>
          </div>
          <div className="bg-[#0d0d0d] brutal-border rounded-sm p-5 text-center">
            <p className="text-2xl font-black text-[#6b8e23] font-mono">1.0%</p>
            <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mt-1">Sovereignty Fee</p>
          </div>
        </div>

        {/* Grant List */}
        <div className="bg-[#0d0d0d] brutal-border rounded-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1a1a1a]">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">Grant History</h2>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {grants.map((grant) => (
              <div key={grant.id} className="px-4 sm:px-6 py-4 hover:bg-[#1a1a1a]/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{grant.title}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{grant.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[9px] font-mono text-gray-600">{grant.date}</span>
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm border border-[#2a2a2a] text-gray-500">
                        {grant.type}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#4ade80] font-mono">${grant.amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SSF Info */}
        <div className="mt-8 bg-[#0d0d0d] brutal-border rounded-sm p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 mb-3">
            About the Sovereign Sound Foundation
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            The SSF is a non-profit organization directly associated with Top Goats. 
            Funded by a 1.0% Sovereignty Fee on platform profits, it provides IP micro-grants 
            and mental health support to underground artists. During Flash Liquidation events, 
            the contribution is doubled to 2.0%.
          </p>
        </div>

        {/* Support & Memberships — real Stripe hosted checkout */}
        <div className="mt-8 bg-[#0d0d0d] brutal-border rounded-sm p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 mb-4">
            Support the Sound
          </h3>
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
          <p className="text-[10px] text-gray-600 mt-4">
            Payments are processed securely via Stripe Checkout.
          </p>
        </div>

      </div>
    </div>
  );
}