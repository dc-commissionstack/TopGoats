import React from 'react';

export default function LandingPage({ onExplore, onJoin, onLogin }) {
  return (
    <div className="min-h-screen text-gray-300 scanlines pt-[100px] bg-transparent">
      <div className="noise" />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Content overlay */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center animate-fade-in-up">
          {/* Tagline */}
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.5em] text-[#f7971e] mb-6 animate-pulse">
            Sovereign Ecosystem for Off-Label Artists
          </p>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.9] mb-8 tracking-[-0.04em]">
            OWN YOUR SOUND.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f7971e] via-[#ffd200] to-[#f7971e] bg-[length:200%_auto] animate-gradient-x">
              NO GATEKEEPERS.
            </span>
          </h1>

          {/* Value proposition */}
          <p className="text-sm sm:text-lg text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            The all-in-one hub for the underground. Host your site, protect your IP, and scale your herd without labels taking a cut.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={onJoin}
              className="group relative w-full sm:w-auto px-12 py-5 bg-[#f7971e] text-black text-sm font-black uppercase tracking-[0.2em] rounded-sm transition-all duration-300 hover:scale-105 hover:bg-[#ffd200] active:scale-95 shadow-[0_0_20px_rgba(247,151,30,0.3)] hover:shadow-[0_0_30px_rgba(247,151,30,0.5)]"
            >
              <span className="relative z-10">Join the Herd</span>
            </button>
            <button
              onClick={onExplore}
              className="w-full sm:w-auto px-10 py-5 border-2 border-[#2a2a2a] text-sm font-bold uppercase tracking-[0.2em] rounded-sm hover:border-[#f7971e] hover:text-[#f7971e] transition-all duration-300 hover:bg-[#f7971e]/5"
            >
              Explore Artists
            </button>
          </div>

          <button 
            onClick={onLogin}
            className="mt-8 text-[10px] uppercase tracking-[0.3em] text-gray-600 hover:text-white transition-colors underline underline-offset-8 decoration-gray-800 hover:decoration-[#f7971e]"
          >
            Already a member? Sign In
          </button>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
      </section>

      {/* Feature Grid with Hover Effects */}
      <section className="py-32 border-t border-white/5 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { 
                title: 'Sovereign Pages', 
                desc: 'Your space. Your prices. Your fans. The ultimate direct-to-fan storefront.',
                icon: '/icons/sovereign-icon.jpg' 
              },
              { 
                title: 'IP Protection', 
                desc: 'Automated fingerprinting at point of upload. Secure your rights before the world hears it.',
                icon: '/icons/ip-icon.jpg' 
              },
              { 
                title: 'The Herd', 
                desc: 'Gamified ranking that lowers your fees as you grow. From Kid to Top Goat.',
                icon: '/icons/herd-icon.jpg' 
              }
            ].map((f, i) => (
              <div key={i} className="group relative bg-[#0a0a0a] brutal-border p-8 transition-all duration-500 hover:-translate-y-2 hover:border-[#f7971e]/50">
                <div className="absolute inset-0 bg-[#f7971e]/0 group-hover:bg-[#f7971e]/2 transition-colors duration-500" />
                <div className="w-16 h-16 mb-8 bg-[#111] brutal-border flex items-center justify-center overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                   <img src={f.icon} alt={f.title} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider mb-4 group-hover:text-[#f7971e] transition-colors">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-300 transition-colors">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Trust Section */}
      <section className="py-20 bg-[#070707] border-y border-white/5">
         <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center gap-12 sm:gap-24 opacity-40">
            {['No Labels', 'No Masters', 'Pure Independence', 'Direct Commerce'].map(text => (
              <span key={text} className="text-[10px] font-bold uppercase tracking-[0.4em] whitespace-nowrap">{text}</span>
            ))}
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <img src="/top-goats-logo.jpg" alt="" className="h-12 mx-auto mb-8 opacity-20 grayscale" />
          <p className="text-[10px] text-gray-600 uppercase tracking-[0.4em] mb-4">
            Top Goats — Independent Music Ecosystem
          </p>
          <p className="text-[10px] text-gray-800">
            Stop asking for permission. Own your future.
          </p>
        </div>
      </footer>
    </div>
  );
}
