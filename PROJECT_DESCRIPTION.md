# FixMyCity — AI-Powered Civic Issue Reporting Platform

## Project Description

**FixMyCity** is an AI-powered web platform that enables citizens to identify, report, track, and resolve local civic issues in their neighborhood. Using Google Gemini AI for intelligent image analysis and issue categorization, the platform bridges the gap between citizens and municipal authorities, making civic engagement accessible, gamified, and data-driven.

---

## Problem Statement

Indian cities face thousands of civic issues daily — potholes, broken streetlights, overflowing garbage, water leaks, open manholes — but citizens lack an efficient, centralized platform to report and track them. Traditional complaint systems (phone calls, emails, paper forms) are slow, unresponsive, and lack transparency. Citizens don't know if their complaint was received, acknowledged, or resolved.

**Key challenges:**
- No real-time visibility into community issues
- Lack of AI-powered prioritization and categorization
- No community verification to filter genuine vs. duplicate reports
- No incentive for citizens to actively participate in civic reporting
- Municipal authorities lack data-driven insights for resource allocation

---

## Our Solution

FixMyCity provides a complete ecosystem for civic issue lifecycle management:

### For Citizens:
1. **Snap & Report** — Take a photo of any issue; AI auto-categorizes it
2. **Track Progress** — Real-time status updates from reported → verified → in_progress → resolved
3. **Earn Rewards** — Points, badges, certificates for active participation
4. **Community Engagement** — Upvote, verify, and comment on issues

### For Municipal Authorities (Admin Portal):
1. **Priority Dashboard** — AI-scored issues sorted by severity
2. **Region-Based Management** — View only jurisdiction-specific issues
3. **Status Management** — Update progress, assign departments
4. **AI Insights** — Predictive analytics, hotspot detection, trend analysis

---

## Key Features

| Feature | Technology | Description |
|---------|-----------|-------------|
| 🤖 AI Image Analysis | Google Gemini 2.0 | Upload photo → AI identifies category, severity, department, impact |
| 📊 AI Predictive Insights | Google Gemini 2.0 | Trending issues, hotspot areas, resolution predictions |
| 🌬️ Live AQI Monitor | Open-Meteo API | Real-time Air Quality Index with location detection |
| 💡 Daily Tips & Facts | uselessfacts API | Daily environmental awareness content |
| 🧠 Eco Quiz | Gemini AI + Fallback | AI-generated community knowledge quiz |
| 🗺️ Interactive Map | Leaflet.js + OpenStreetMap | Visual issue markers with severity colors |
| 🏆 Gamification | Custom Implementation | Points, badges, leaderboard, challenges, rewards |
| 🔐 Role-Based Access | NextAuth.js | Separate citizen & admin experiences |
| 🌍 Region Filtering | MongoDB Queries | Users see only their state's issues |
| ☁️ Cloud Image Upload | Cloudinary | Optimized image storage & delivery |
| 🔄 Auto-Cleanup | MongoDB TTL | Closed issues auto-delete after 15 days |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Backend** | Next.js API Routes (Serverless) |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **AI/ML** | Google Gemini 2.0 Flash |
| **Authentication** | NextAuth.js (JWT Sessions) |
| **Maps** | Leaflet.js + OpenStreetMap |
| **Image Storage** | Cloudinary (CDN-optimized) |
| **AQI Data** | Open-Meteo Air Quality API |
| **Deployment** | Vercel / Google Cloud Run |
| **Version Control** | Git + GitHub |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Client (Browser)               │
│    Next.js 15 React App + Tailwind CSS           │
├─────────────────────────────────────────────────┤
│                 Next.js API Routes               │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐│
│  │ Auth API │ │Issues API│ │ AI Analysis API   ││
│  │(NextAuth)│ │(CRUD+Map)│ │(Gemini Vision)   ││
│  └──────────┘ └──────────┘ └──────────────────┘│
├─────────────────────────────────────────────────┤
│              External Services                   │
│  ┌─────────┐ ┌──────────┐ ┌─────────────────┐  │
│  │MongoDB  │ │Cloudinary│ │ Google Gemini AI │  │
│  │ Atlas   │ │ (Images) │ │ (Analysis/Quiz) │  │
│  └─────────┘ └──────────┘ └─────────────────┘  │
│  ┌─────────────────┐ ┌────────────────────────┐ │
│  │Open-Meteo (AQI) │ │ OpenStreetMap (Tiles)  │ │
│  └─────────────────┘ └────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## How AI is Used (Google Gemini Integration)

### 1. Issue Image Analysis
When a user uploads a photo of a civic issue, Gemini AI:
- **Categorizes** the issue (pothole, garbage, streetlight, etc.)
- **Determines severity** (low, medium, high, critical)
- **Suggests department** to handle it (BBMP, PWD, DJB, etc.)
- **Estimates impact** on the community
- **Recommends resolution steps**
- **Assigns priority score** (1-10)

### 2. Community Insights Dashboard
Gemini analyzes all reported issues and provides:
- Trending issue categories
- Hotspot areas with recurring problems
- Predictions for upcoming issues
- Overall community health score (1-100)
- Actionable recommendations for authorities

### 3. Quiz Generation
Gemini generates fresh, easy, community-relevant quiz questions about:
- Environment, recycling, water conservation
- Road safety, civic duties, waste management

---

## User Roles

### Citizens (Regular Users)
- Register with state selection
- Report issues with photos
- Browse & verify community issues
- Participate in challenges & quiz
- Earn points & redeem rewards
- View leaderboard

### Admin (Municipal Authorities)
- Dedicated admin dashboard
- Priority-sorted issue management
- Status updates & department assignment
- Region-restricted view (own jurisdiction only)
- AI-powered insights & analytics

---

## Deployment

- **Live URL (Vercel):** https://community-hero-xi.vercel.app
- **GitHub Repository:** https://github.com/Neha-Kumari2311/community-hero
- **GCP-Ready:** Dockerfile included for Google Cloud Run deployment

---

## Future Scope

1. **Government API Integration** — Direct submission to Swachh Bharat / CPGRAMS portals
2. **Push Notifications** — Real-time alerts when issues are updated
3. **Multi-language Support** — Hindi, Kannada, Tamil, Telugu
4. **SMS-based Reporting** — For users without smartphones
5. **IoT Sensor Integration** — Auto-detect issues (smart dustbins, water sensors)
6. **Blockchain Verification** — Tamper-proof issue logging
7. **Mobile App** — React Native version for iOS/Android

---

## Team

- **Neha Kumari** — Full-Stack Developer

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Citizen (Karnataka) | neha@test.com | password123 |
| Citizen (Delhi) | ansh@test.com | password123 |
| Admin (Karnataka - BBMP) | admin@bbmp.gov | password123 |
| Admin (Delhi) | admin@municipality.gov | password123 |

---

## How to Run Locally

```bash
git clone https://github.com/Neha-Kumari2311/community-hero.git
cd community-hero
npm install
cp .env.example .env.local  # Fill in your API keys
node scripts/seed.js        # Seed demo data
npm run dev                 # Open http://localhost:3000
```

---

*Built with ❤️ using Next.js, Google Gemini AI, MongoDB Atlas & Cloudinary*
