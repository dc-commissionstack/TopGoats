// Client helper to start a Stripe Checkout Session and redirect the buyer.

export async function redirectToCheckout(type, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('tg_token');
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch('/api/checkout/session', {
    method: 'POST',
    headers,
    body: JSON.stringify({ type, ...opts }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Checkout failed');
  if (data.url) {
    window.location.href = data.url;
  }
  return data;
}
