import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ArtistPage from './components/ArtistPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfileSettings from './components/ProfileSettings';

function App() {
  const [page, setPage] = useState('landing'); // 'landing', 'artist', 'login', 'register', 'settings'
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // On mount, check for existing token
  useEffect(() => {
    const token = localStorage.getItem('tg_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setCurrentUser(data.user);
          } else {
            localStorage.removeItem('tg_token');
          }
        })
        .catch(() => localStorage.removeItem('tg_token'))
        .finally(() => setCheckingAuth(false));
    } else {
      setCheckingAuth(false);
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setPage('artist');
  };

  const handleRegister = (user) => {
    setCurrentUser(user);
    setPage('artist');
  };

  const handleLogout = () => {
    localStorage.removeItem('tg_token');
    setCurrentUser(null);
    setPage('landing');
  };

  const handleUpdateProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center scanlines pt-14 bg-[#050505]">
        <div className="noise" />
        <p className="text-xs text-gray-600 uppercase tracking-[0.2em]">Loading...</p>
      </div>
    );
  }

  // Show landing page without header/background (self-contained design)
  if (page === 'landing') {
    return (
      <LandingPage
        onExplore={() => setPage('artist')}
        onJoin={() => setPage('register')}
      />
    );
  }

  return (
    <>
      {/* Brand background image */}
      <div id="brand-bg">
        <img src="/top-goats-bg.jpg" alt="" aria-hidden="true" />
      </div>

      {/* Site header with logo and navigation */}
      <header className="site-header">
        <div className="flex items-center gap-3">
          <button onClick={() => setPage('landing')} className="flex items-center gap-3">
            <img src="/top-goats-logo.jpg" alt="Top Goats" className="site-logo" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/70 hidden sm:block">
              Top Goats
            </span>
          </button>
        </div>
        <nav className="flex items-center gap-4">
          <button onClick={() => setPage('artist')}
            className="text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-[#f7971e] transition-colors">
            Explore
          </button>
          <a href="/api/herd/tiers"
            className="text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-[#f7971e] transition-colors">
            The Herd
          </a>
          <a href="/api/herd/leaderboard"
            className="text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-[#f7971e] transition-colors">
            Leaderboard
          </a>
          {currentUser ? (
            <>
              <span className="text-[10px] text-gray-600 hidden sm:block">{currentUser.handle}</span>
              <button onClick={() => setPage('settings')} aria-label="Settings"
                className="text-[10px] uppercase tracking-[0.2em] text-[#f7971e] hover:text-[#ffd200] transition-colors">
                Settings
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setPage('login')} aria-label="Sign in"
                className="text-[10px] uppercase tracking-[0.2em] text-[#f7971e] hover:text-[#ffd200] transition-colors">
                Sign In
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Page routing */}
      {page === 'login' && (
        <LoginPage
          onLogin={handleLogin}
          onSwitchToRegister={() => setPage('register')}
        />
      )}
      {page === 'register' && (
        <RegisterPage
          onRegister={handleRegister}
          onSwitchToLogin={() => setPage('login')}
        />
      )}
      {page === 'settings' && (
        <ProfileSettings
          user={currentUser}
          onUpdate={handleUpdateProfile}
          onLogout={handleLogout}
        />
      )}
      {page === 'artist' && <ArtistPage user={currentUser} />}
    </>
  );
}

export default App;