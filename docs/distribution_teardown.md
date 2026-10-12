# Competitive Teardown: Heard/Vydia Distribution + White-Label Partner Options

**Prepared by:** agent-researcher
**Date:** 2026-09-04
**Purpose:** Give the owner a clear decision-ready picture of what Heard Distribution + Vydia offer, what white-label distribution back-ends exist, and how Top Goats can differentiate.

---

## 1. Competitor: Heard Distribution

**What it is:** A white-label music distribution platform that lets labels, management companies, and artist platforms offer "distribution to 200+ DSPs" under their own brand. Positioned as a B2B infrastructure layer.

**Public pricing (per artist):**
- **Heard Starter:** ~$29/mo per artist — distribution to Spotify, Apple Music, YouTube Music, TikTok, Instagram, etc.
- **Heard Pro:** Pricing not public; adds publishing administration, sync licensing, rights management
- Source: hearddist.co (pricing page requires signup — exact tiers behind login wall)

**Features advertised (public page):**
- Distribution to 200+ streaming platforms
- Publishing administration (PRO registration, royalty collection)
- Sync licensing (TV, film, game placements)
- Rights management (Content ID, takedowns)
- Metadata management
- Automated royalty collection
- Playlist pitching tools

Source: https://hearddist.co/

---

## 2. Competitor: Vydia (Video Distribution)

**What it is:** Video supply chain infrastructure acquired by Gamma. Handles video delivery and monetization (YouTube Content ID, Vevo, etc.).

**Public positioning:** "End-to-end video supply chain" — video hosting, distribution, monetization, and analytics. Primarily B2B; not artist-facing.

**Pricing:** Not public. Revenue-share based (varies by deal size). 
Source: https://vydia.com/

---

## 3. White-Label Distribution Back-Ends — Who Actually Moves the Music

These are the companies that handle the actual ingestion, metadata, and delivery to DSPs. A platform like Top Goats would partner with one to offer "distribution to 200+ stores" without building the pipeline.

### 3.1 Gyrostream — Best-Accessible White-Label

| Detail | Value |
|--------|-------|
| **What** | White-label music distribution API. Platform partners get their own branded distribution service. |
| **Pricing** | **$99/mo (Starter), $149/mo (Business)** — public pricing |
| **Stores** | Spotify, Apple Music, YouTube Music, TikTok, Instagram, Deezer, Tidal, Amazon Music, Pandora, etc. |
| **API/White-label** | ✅ Yes — designed for platforms and labels to offer distribution under their own brand |
| **Payout timing** | Monthly, once earnings reported from DSPs |
| **Revenue model** | Flat monthly fee to the platform; the platform sets end pricing to artists |
| **Source** | https://gyrostream.com/pricing (public pricing) |

**Top Goats fit:** Best option for a Phase 1 white-label. $99/mo flat, API access, we keep whatever we charge artists above $99. At 5 artists paying $9.99/mo, we break even on the distribution layer.

### 3.2 Label Engine

| Detail | Value |
|--------|-------|
| **What** | Distribution, promotion, and accounting platform for independent labels |
| **Pricing** | Not public — contact sales |
| **White-label** | ✅ Yes — used by independent labels |
| **Source** | https://label-engine.com/ |

### 3.3 FUGA (Downtown Music Holdings)

| Detail | Value |
|--------|-------|
| **What** | Enterprise B2B distribution infrastructure. Powers label services for major indies. |
| **Pricing** | Not public — enterprise deals only |
| **White-label** | ✅ Yes — but only for mid-to-large labels |
| **Source** | https://fuga.com/ |

### 3.4 Symphonic

| Detail | Value |
|--------|-------|
| **What** | Independent music distribution + publishing |
| **Pricing** | Not public for white-label. Artist plans: Starter (free, takes 20%), Partner (~$19.99/yr takes 15%) |
| **White-label** | ✅ Not directly — more label services. Inquiry required. |
| **Source** | https://symphonic.com/ |

### 3.5 DistroKid (No White-Label API)

| Detail | Value |
|--------|-------|
| **What** | Direct-to-artist distribution. No white-label/reseller program. |
| **Pricing** | Musician: $22.99/yr (1 artist), Musician Plus: $39.99/yr (2 artists), Ultimate: $89.99/yr (5 artists), Label: from $22.99/yr per artist |
| **White-label** | ❌ No public reseller/white-label program |
| **Source** | https://distrokid.com/pricing |

### 3.6 Amuse

| Detail | Value |
|--------|-------|
| **What** | Free distribution tier (takes 15%) + Pro tier ($59.99/yr) |
| **White-label** | ❌ Not available — artist-facing only |
| **Source** | https://www.amuse.io/ |

### 3.7 Rehegoo

| Detail | Value |
|--------|-------|
| **What** | White-label distribution for record labels |
| **Pricing** | Not public — contact sales |
| **White-label** | ✅ Yes — label-focused |
| **Source** | https://rehegoo.com/ |

---

## 4. Economics — Platform Margin Model

For a platform white-labeling distribution:

```
Artist revenue = Sale price × (1 - DSP cut*) × (1 - platform fee)
                                                          ↑ Top Goats Herd fee
Platform cost = Distribution partner monthly fee ÷ number of artists
Platform margin = (Platform fee × artist revenue) - distribution cost per artist
```

*DSP cut: Spotify ~30%, Apple Music ~30%, Tidal ~30%, Bandcamp 10-15%

**Example with Gyrostream:**
- 20 Premium artists paying $9.99/mo = $199.80/mo revenue to Top Goats
- Gyrostream business plan: $149/mo
- Gross margin: $50.80/mo on distribution alone (not counting transaction fees or a-la-carte)
- At 50 artists: $499.50 revenue - $149 = **$350.50/mo margin**

**Heard comparison:** At $29/mo per artist (Heard's model), the platform pays $29/mo *per artist* — unsustainable for small platforms with <100 artists. At 100 artists that's $2,900/mo.

**Recommended model:** Gyrostream at $99-$149/mo flat (not per-artist). Bundle distribution into Premium tier.

---

## 5. The "Better" Angle — Top Goats vs. Commodity Distribution

Distribution to DSPs is commoditized. Every platform (DistroKid, TuneCore, Amuse, Heard) does it. **What Top Goats uniquely offers:**

| Differentiator | Top Goats Has It? | Heard/Vydia |
|----------------|------------------|-------------|
| Copyright-at-upload fingerprinting | ✅ On roadmap (Sovereignty Shield) | ❌ |
| Direct-to-fan pricing (artist sets price) | ✅ Core model | ❌ (DSP pricing only) |
| Gamified Herd hierarchy (earned XP lowers fees) | ✅ Live | ❌ |
| Private track storage (presigned URLs) | ✅ Live (Neon Object Storage) | ❌ |
| Flash liquidation events ($1/song Stampede) | ✅ Designed | ❌ |
| Platform-owned Stripe checkout (not just DSP) | ✅ Live (Stripe) | ❌ |
| Community consensus / artist agreement on platform deals | ✅ Founding Goat agreement | ❌ |
| Non-profit (SSF) funded by platform profits | ✅ 1.0% Sovereignty Fee | ❌ |

**The play:** Offer commodity distribution through Gyrostream as a **feature of Premium**, not the product itself. The product is sovereignty — owning your masters, selling direct, protecting IP, and being part of a community (Herd) that rewards independence. Distribution is table stakes; the Herd is the moat.

---

## 6. Recommendation

### Phase 1 (Now): Direct sales only
- Stripe checkout already live. No distribution partner needed yet.
- Artists sell directly through Top Goats pages. No DSP delivery.
- This is the sovereignty play — sell direct, keep 100% minus Top Goats fee.

### Phase 2 (Month 3-4): Add distribution via Gyrostream
- Sign Gyrostream Business plan ($149/mo).
- Bundle distribution into Ram tier ($19.99/mo) and above.
- Artists can choose: sell only on Top Goats (lower fee), OR distribute to DSPs through us (higher Premium tier).
- At 15 Premium artists, the Gyrostream cost is covered.

### Phase 3 (Month 6+): Evaluate Heard/FUGA for scale
- If 100+ Premium artists, evaluate enterprise partners.
- Heard at $2,900/mo for 100 artists is steep; negotiate volume or stay with Gyrostream.

**Do NOT build distribution in-house.** The DSP relationships, metadata standards, and content ingestion pipeline are a separate business. White-label through Gyrostream is the right Phase 2 play.

---

**Sources:**
- https://hearddist.co/ (Heard public page)
- https://vydia.com/ (Vydia public page)
- https://gyrostream.com/pricing (Gyrostream public pricing)
- https://distrokid.com/pricing (DistroKid public pricing)
- https://www.tunecore.com/pricing (TuneCore public pricing)
- https://www.amuse.io/ (Amuse public page)
- https://symphonic.com/ (Symphonic public page)
- https://label-engine.com/ (Label Engine)
- https://fuga.com/ (FUGA)
- https://rehegoo.com/ (Rehegoo)