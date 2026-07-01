import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ArtistPage from './components/ArtistPage';
import HerdPage from './components/HerdPage';
import LeaderboardPage from './components/LeaderboardPage';
import SovereigntyLedgerPage from './components/SovereigntyLedgerPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfileSettings from './components/ProfileSettings';

function App() {
  const [page, setPage] = useState('landing');
  const [targetArtistId, setTargetArtistId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Navigate to an artist page by ID
  const goToArtist = (artistId) => {
    setTargetArtistId(artistId);
    setPage('artist');
  };

  useEffect(() => {
    const token = localStorage.getItem('tg_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
        } else {
          localStorage.removeItem('tg_token');
        }
      })
      .catch(() => {
        localStorage.removeItem('tg_token');
      })
      .finally(() => {
        setCheckingAuth(false);
      });
    } else {
      setCheckingAuth(false);
    }
  }, []);

  const handleLogin = (user, token) => {
    localStorage.setItem('tg_token', token);
    setCurrentUser(user);
    goToArtist(user.id);
  };

  const handleRegister = (user, token) => {
    localStorage.setItem('tg_token', token);
    setCurrentUser(user);
    goToArtist(user.id);
  };

  const handleLogout = () => {
    localStorage.removeItem('tg_token');
    setCurrentUser(null);
    setTargetArtistId(null);
    setPage('landing');
  };

  const handleUpdateProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center scanlines pt-[100px] bg-[#050505]">
        <div className="noise" />
        <p className="text-xs text-gray-600 uppercase tracking-[0.2em]">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* Brand background image */}
      <div id="brand-bg">
        <img src="/top-goats-bg.jpg" alt="" aria-hidden="true" />
      </div>

      {/* Global transparent goats */}
      <div id="global-goats">
        <img src="/three-goats.png" alt="" aria-hidden="true" />
      </div>

      {/* Brutalist Grid Overlay */}
      <div id="brutalist-grid" />

      {/* Global Header */}
      <header className="site-header">
        <div className="flex items-center gap-3">
          <button onClick={() => setPage('landing')} className="flex items-center gap-3 group cursor-pointer">
            <img src="/top-goats-logo.jpg" alt="Top Goats" className="site-logo" />
            <span className="text-xl font-black uppercase tracking-[0.3em] text-white hidden sm:block group-hover:text-[#f7971e] transition-colors">
              Top Goats
            </span>
          </button>
        </div>
        <nav className="flex items-center gap-6">
          <button onClick={() => {
            if (currentUser) {
              goToArtist(currentUser.id);
            } else {
              setTargetArtistId(null);
              setPage('artist');
            }
          }}
            className={`text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer transition-all hover:text-[#f7971e] ${page === 'artist' ? 'text-[#f7971e] border-b-2 border-[#f7971e]' : 'text-gray-500'}`}>
            Explore
          </button>
          <button onClick={() => setPage('herd')}
            className={`text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer transition-all hover:text-[#f7971e] ${page === 'herd' ? 'text-[#f7971e] border-b-2 border-[#f7971e]' : 'text-gray-500'}`}>
            The Herd
          </button>
          <button onClick={() => setPage('leaderboard')}
            className={`text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer transition-all hover:text-[#f7971e] ${page === 'leaderboard' ? 'text-[#f7971e] border-b-2 border-[#f7971e]' : 'text-gray-500'}`}>
            Leaderboard
          </button>
          <button onClick={() => setPage('ledger')}
            className={`text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer transition-all hover:text-[#6b8e23] ${page === 'ledger' ? 'text-[#6b8e23] border-b-2 border-[#6b8e23]' : 'text-gray-500'}`}>
            Ledger
          </button>

          <div className="h-4 w-[1px] bg-gray-800 mx-2" />

          {currentUser ? (
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-gray-500 font-mono hidden md:block">{currentUser.handle}</span>
              <button onClick={() => setPage('settings')} aria-label="Settings"
                className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 brutal-border-gold cursor-pointer transition-all hover:bg-[#f7971e] hover:text-black ${page === 'settings' ? 'bg-[#f7971e] text-black' : 'text-[#f7971e]'}`}>
                Profile
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={() => setPage('login')} aria-label="Sign in"
                className="text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer text-white hover:text-[#f7971e] transition-all">
                Log In
              </button>
              <button onClick={() => setPage('register')} aria-label="Join"
                className="text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer px-4 py-2 bg-[#f7971e] text-black rounded-sm hover:bg-[#ffd200] transition-all">
                Join
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Page Content */}
      <main className="animate-fade-in">
        {page === 'landing' && (
          <LandingPage
            onExplore={() => {
              if (currentUser) {
                goToArtist(currentUser.id);
              } else {
                setTargetArtistId(null);
                setPage('artist');
              }
            }}
            onJoin={() => setPage('register')}
            onLogin={() => setPage('login')}
          />
        )}
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
        {page === 'artist' && <ArtistPage user={currentUser} artistId={targetArtistId} />}
        {page === 'herd' && <HerdPage user={currentUser} />}
        {page === 'leaderboard' && <LeaderboardPage onSelectArtist={goToArtist} />}
        {page === 'ledger' && <SovereigntyLedgerPage />}
      </main>
    </>
  );
}

export default App;
