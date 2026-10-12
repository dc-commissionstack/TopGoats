# Top Goats: Independent Music Ecosystem — Platform Capabilities

This document outlines the full scope of functionality, technical architecture, and strategic framework developed for **Top Goats**.

---

## 1. Core Technical Stack
*   **Frontend**: React 19 + Vite + Tailwind CSS (Brutalist Kristal-black theme).
*   **Backend**: Node.js (Express) with high-security headers (Helmet) and CORS.
*   **Database**: Turso (Edge SQLite) for low-latency artist profiles and track metadata.
*   **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing.
*   **File Handling**: Multer-based secure audio upload system (MP3, WAV, FLAC, AAC, OGG, M4A).
*   **Hosting/Ops**: Monorepo structure pushed to GitHub (`dc-commissionstack/TopGoats`).

---

## 2. User & Artist Ecosystem
*   **Secure Authentication**: full register/login flow with email and handle validation.
*   **Sovereign Profile Management**: Artists can edit their display names, handles, bios, locations, and genres.
*   **Rank Visibility**: Real-time display of the artist's "Herd" rank and XP progress on their profile.
*   **Admin System**: Pre-configured admin account (`admin@topgoats.io`) for platform oversight.

---

## 3. "The Herd" Ranking Engine (Gamification)
A 5-tier system designed to reward platform utility and community engagement:
*   **Tiers**: Kid (0 XP), Yearling (500 XP), Ram (2,500 XP), Great Goat (10,000 XP), Top Goat (50,000 XP).
*   **XP Triggers**:
    *   *Social*: Creating posts, commenting, receiving upvotes, check-in streaks.
    *   *Utility*: Completing profile, first track upload (+100 XP), copyright fingerprinting.
    *   *Commercial*: First sale made (+500 XP), every $10 in GMV.
*   **Incentives**: Higher tiers unlock lower transaction fees (as low as 4.0%) and "Main Stage" promotional placement.

---

## 4. Sovereign Artist Pages
Customizable, high-impact landing pages for every off-label artist:
*   **Integrated Music Player**: Fetches and plays real audio files uploaded by the artist.
*   **Sovereign Verification**: "Sovereign Artist" badge confirming the artist owns 100% of their masters and publishing.
*   **Commerce Ready**: Built-in support buttons for "Buy All Tracks," "Buy Individual Track," and "Tip Artist" (Stripe integration ready).
*   **IP Protection**: Integrated messaging regarding automated copyright fingerprinting at the point of upload.

---

## 5. Music Upload & Distribution
*   **Secure Upload**: Artists can upload tracks up to 50MB directly from their dashboard.
*   **Metadata Storage**: Automated tracking of play counts, file sizes, and creation dates.
*   **Edge Delivery**: Files are served through a secure `/uploads` path directly from the ecosystem core.

---

## 6. Financial & Commercial Framework
*   **Flash Liquidation ("Herd Stampede")**: Technical model for $1.00 platform-wide song deals.
*   **Microtransaction Optimization**: Proactive use of Stripe’s 5% + $0.05 pricing model for transactions under $5.00.
*   **Cart Batching**: Logic to encourage "Crate Filling" to optimize for the 2.9% + $0.30 standard fee on larger totals.
*   **Artist-First Splits**: 90% net revenue to the artist during liquidation events.

---

## 7. The Sovereign Sound Foundation (SSF)
A built-in non-profit framework for giving back to the community:
*   **Funding**: 1.0% platform "Sovereignty Fee" on all profits.
*   **The Pillar Match**: Platform donates 10% of its share to the SSF during liquidation events to maximize impact.
*   **Governance**: Managed by a "Council of Top Goats" (artists at 50,000+ XP).
*   **Mission**: Providing micro-grants for IP protection and mental health support for off-label artists.

---

## 8. Brand Identity
*   **Aesthetic**: "Kristal-black" brutalist design with hyper-dark palettes (#050505), high-contrast white/gold typography, and intentional scanline/noise overlays.
*   **Assets**: High-quality transparent "Three Goats" hero graphics and custom-themed feature icons.
*   **Impact**: Designed to look like a premium, high-end underground label hub rather than a generic social network.
