import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Canonical-domain redirect: the apex (top-goats.com) is the marketing entry point,
// but the live product runs on app.top-goats.com (correct DB/auth/Stripe config).
// Send apex visitors to the canonical app so signup/login actually work.
if (typeof window !== 'undefined') {
  const host = window.location.hostname.toLowerCase();
  if (host === 'top-goats.com' || host === 'www.top-goats.com') {
    window.location.replace(
      `https://app.top-goats.com${window.location.pathname}${window.location.search}`
    );
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);