import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen text-gray-300 bg-kristal">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-kristal/80 backdrop-blur-xl border-b border-kristal-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/top-goats-logo.jpg" alt="Top Goats" className="h-8 w-auto opacity-90" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-white hidden sm:inline">
              Top Goats
            </span>
          </a>
          <a
            href="https://app.top-goats.com"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-gold transition-colors border border-kristal-border rounded-sm px-4 py-2 hover:border-gold/30"
          >
            Launch App →
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/top-goats-bg.jpg"
            alt=""
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-kristal/70 via-kristal/40 to-kristal" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Tagline */}
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.5em] text-gold mb-8 animate-fade-in">
            Sovereign Ecosystem for Off-Label Artists
          </p>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.9] mb-8 tracking-[-0.04em] font-[Inter] animate-fade-in-up">
            OWN YOUR SOUND.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-bright to-gold animate-gradient-x">
              NO PERMISSION.
            </span>
          </h1>

          {/* Value proposition */}
          <p className="text-sm sm:text-lg text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium animate-fade-in-delayed">
            The all-in-one hub for underground music. Host your sovereign page,
            protect your IP, sell your music —{" "}
            <span className="text-white">no labels taking a cut.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-delayed">
            <a
              href="https://app.top-goats.com"
              className="group relative w-full sm:w-auto px-12 py-5 bg-gold text-black text-sm font-black uppercase tracking-[0.2em] rounded-sm transition-all duration-300 hover:scale-105 hover:bg-gold-bright active:scale-95 shadow-[0_0_20px_rgba(247,151,30,0.3)] hover:shadow-[0_0_30px_rgba(247,151,30,0.5)]"
            >
              <span className="relative z-10">Join the Herd</span>
            </a>
            <a
              href="#features"
              className="w-full sm:w-auto px-10 py-5 border-2 border-kristal-border text-sm font-bold uppercase tracking-[0.2em] rounded-sm hover:border-gold hover:text-gold transition-all duration-300 hover:bg-gold/5"
            >
              What We Build
            </a>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-kristal to-transparent pointer-events-none" />
        </div>
      </section>

      {/* Manifesto Strip */}
      <section className="py-16 bg-kristal-light border-y border-kristal-border">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center gap-8 sm:gap-20 opacity-50">
          {["No Labels", "No Masters", "Pure Independence", "Direct Commerce"].map(
            (text) => (
              <span
                key={text}
                className="text-[10px] font-bold uppercase tracking-[0.4em] whitespace-nowrap"
              >
                {text}
              </span>
            )
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-4 text-center">
            The Platform
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-20">
            Everything you need.{" "}
            <span className="text-gold">Nothing you don&apos;t.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Sovereign Pages",
                desc: "Your space. Your prices. Your fans. A dedicated artist page with music player, bio, and direct-to-fan storefront — no middleman taking 15%.",
                icon: "🏠",
              },
              {
                title: "Sovereignty Shield",
                desc: "Automated copyright fingerprinting at point of upload. Lock your IP before the world hears it. Earn XP and unlock lower fees.",
                icon: "🛡️",
              },
              {
                title: "$1 Songs & Flash Deals",
                desc: "Set your own price. Opt into platform-wide flash liquidation events where every track is $1 — driving volume and discovery.",
                icon: "⚡",
              },
              {
                title: "The Herd Hierarchy",
                desc: "Climb from Kid → Yearling → Ram → Great Goat → Top Goat. Higher rank means lower fees. Your grind, rewarded.",
                icon: "🐐",
              },
              {
                title: "Direct Commerce",
                desc: "Stripe-powered payments go straight to artists. Platform fees start at 5% and drop to 2% as you rank up. No hidden cuts.",
                icon: "💳",
              },
              {
                title: "Community-First",
                desc: "Leaderboards, XP for everything you do, and a platform that celebrates the underground — not the algorithm.",
                icon: "🌍",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="group relative bg-kristal-light brutal-border p-8 transition-all duration-500 hover:-translate-y-2 hover:border-gold/50"
              >
                <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/[0.02] transition-colors duration-500" />
                <div className="w-14 h-14 mb-6 bg-kristal-mid brutal-border flex items-center justify-center text-2xl">
                  {f.icon}
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider mb-3 group-hover:text-gold transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Herd Tier Breakdown */}
      <section className="py-32 bg-kristal-light border-y border-kristal-border">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-4 text-center">
            The Ranks
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-16">
            Your grind defines{" "}
            <span className="text-gold">your cut.</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: "Kid", xp: "0 XP", fee: "5.0%", color: "border-gray-700 text-gray-500" },
              { name: "Yearling", xp: "500 XP", fee: "4.5%", color: "border-gray-600 text-gray-400" },
              { name: "Ram", xp: "2,500 XP", fee: "4.0%", color: "border-gray-500 text-gray-300" },
              { name: "Great Goat", xp: "10,000 XP", fee: "3.0%", color: "border-amber-700 text-amber-500" },
              { name: "Top Goat", xp: "50,000 XP", fee: "2.0%", color: "border-gold text-gold shadow-[0_0_15px_rgba(247,151,30,0.2)]" },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`brutal-border p-5 text-center transition-all duration-300 hover:scale-105 ${tier.color}`}
              >
                <div className="text-lg font-black uppercase mb-1">{tier.name}</div>
                <div className="text-[10px] text-gray-600 mb-1">{tier.xp}</div>
                <div className="text-xs font-bold">Fee: {tier.fee}</div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-600 text-center mt-6 uppercase tracking-[0.2em]">
            Earn XP through uploads, copyright filings, community engagement &amp; sales
          </p>
        </div>
      </section>

      {/* Sovereign Sound Foundation */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-4">
            Giving Back
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-8">
            The{" "}
            <span className="text-gold">Sovereign Sound Foundation</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed mb-12">
            1% of every platform transaction funds the SSF — our in-house nonprofit
            providing IP micro-grants for underground artists, mental health support,
            and independent arts advocacy. We&apos;re building an ecosystem that gives
            back, transparently.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              {
                title: "IP Micro-Grants",
                desc: "Funding copyright filings for artists who can't afford the legal fees. Protect your work, regardless of budget.",
              },
              {
                title: "Mental Health",
                desc: "Crisis support and wellness resources for the underground community. The grind is real — so is the help.",
              },
              {
                title: "Arts Advocacy",
                desc: "Contract reviews, legal workshops, and education to keep independent artists informed and empowered.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-kristal-light brutal-border p-6"
              >
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-gray-600 mt-10 uppercase tracking-[0.2em]">
            Funded by a permanent 1.0% Sovereignty Fee on platform profits — not donations
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-kristal-light border-t border-kristal-border">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">
            Stop asking for{" "}
            <span className="text-gold">permission.</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-lg mx-auto mb-10 leading-relaxed">
            Top Goats is being built by and for the underground. We&apos;re in
            active development — the platform is live, artists are joining, and
            every feature ships with sovereignty in mind.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://app.top-goats.com"
              className="w-full sm:w-auto px-12 py-5 bg-gold text-black text-sm font-black uppercase tracking-[0.2em] rounded-sm transition-all duration-300 hover:scale-105 hover:bg-gold-bright active:scale-95 shadow-[0_0_20px_rgba(247,151,30,0.3)]"
            >
              Join the Herd
            </a>
            <a
              href="mailto:herd@topgoats.com"
              className="w-full sm:w-auto px-10 py-5 border-2 border-kristal-border text-sm font-bold uppercase tracking-[0.2em] rounded-sm hover:border-gold hover:text-gold transition-all duration-300"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-kristal-border">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <img
            src="/top-goats-logo.jpg"
            alt=""
            className="h-10 mx-auto mb-6 opacity-20"
          />
          <p className="text-[10px] text-gray-600 uppercase tracking-[0.4em] mb-3">
            Top Goats — Independent Music Ecosystem
          </p>
          <p className="text-[10px] text-gray-700 mb-6">
            Own your future. No gatekeepers.
          </p>
          <p className="text-[10px] text-gray-800">
            &copy; {new Date().getFullYear()} Top Goats. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}