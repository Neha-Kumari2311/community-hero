#  CommunityHero

**AI-powered civic issue reporting and resolution platform for Indian communities.**

CommunityHero empowers citizens to report, track, and resolve local infrastructure and civic issues using AI-powered image recognition, community verification, and gamification. It bridges the gap between citizens and municipal authorities through technology.

---

##  Live Features

### 🤖 AI-Powered Issue Analysis (Google Gemini)
- **Image Recognition** — Upload a photo of any civic issue (pothole, garbage, broken streetlight) and Gemini AI automatically:
  - Identifies the issue category
  - Determines severity level (low/medium/high/critical)
  - Suggests the responsible government department
  - Estimates community impact
  - Provides step-by-step resolution recommendations
  - Assigns a priority score (1-10)

### AI-Powered Community Insights Dashboard
- **Predictive Analytics** — Gemini AI analyzes all reported issues and provides:
  - Trending issue categories
  - Hotspot areas with recurring problems
  - Resolution rate analysis
  - Predictions for upcoming issues
  - Community health score (1-100)
  - Actionable recommendations

###  Real-Time Air Quality Index (AQI)
- Live AQI data using Open-Meteo API (no API key needed)
- Auto-detects user's location via browser geolocation
- Shows PM2.5, PM10, NO₂, Ozone levels
- Color-coded severity (Good → Hazardous)
- Displayed on homepage and navbar badge

###  Daily Information & Tips
- **Did You Know?** — Daily random facts via uselessfacts API
- **Community Tip of the Day** — 30+ curated tips about environment, safety, water conservation, waste management, road safety
- Changes daily based on day-of-year rotation

### Eco & Community Quiz
- AI-generated quiz questions via Gemini API (when quota available)
- Fallback: 20+ hardcoded community/environment-themed easy questions
- Topics: recycling, water conservation, road safety, civic duties, pollution
- Streak bonus scoring system
- Random 10 questions per session from pool

### Issue Reporting
- Photo upload with AI auto-analysis
- Manual category selection (pothole, water leakage, streetlight, waste, road damage, drainage, public property, safety hazard, pollution, other)
- Location input with address
- Video upload support
- Auto-assigns region based on user's registered state

###  Interactive Map View
- Leaflet-powered interactive map showing all issues
- Custom colored markers based on severity (red=critical, orange=high, yellow=medium, blue=low)
- Category emoji icons on markers
- Click popup with issue details and "View Details" link
- Filter by category
- Auto-fits bounds to show all markers

###  Community Engagement
- **Upvoting** — Support issues you've encountered
- **Verification** — Confirm issues reported by others (+5 points)
- **Comments** — Add context and updates to issues
- **Resolved Voting** — Community confirms when issues are fixed

### Gamification System
- **Points** — Earn points for reporting (10pts), verifying (5pts), getting upvotes
- **Leaderboard** — Compete with other community members
- **Badges** — First Report, Verifier, Community Helper, Guardian
- **Daily/Weekly Challenges** — Time-limited goals with bonus rewards
- **Rewards Store** — Redeem points for:
  - Bronze/Silver/Gold certificates
  - Plant a tree in your name
  - Local shop discount vouchers
  - Community recognition badges

###  Role-Based Access (Admin vs User)
- **Citizens**: Report issues, earn points, participate in challenges/quiz/rewards
- **Admins (Municipality Officers)**: Dedicated admin panel with:
  - Priority-sorted issue management
  - Status updates (reported → verified → in_progress → resolved → closed)
  - Department assignment
  - Issue escalation
  - Different navbar with "Admin Panel" link and 🛡️ Admin badge

###  Region-Based Filtering
- Users select their state during registration (all Indian states + UTs)
- Issues are automatically tagged with the reporter's region
- Users only see issues from their own state
- Admins only manage issues in their jurisdiction
- Issues auto-filter on the issues page and map

###  Auto-Cleanup
- Issues with status "closed" are automatically deleted after 15 days
- Keeps the database clean and relevant

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes (serverless) |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | NextAuth.js (Credentials provider, JWT sessions) |
| AI | Google Gemini 2.0 Flash (image analysis, insights, quiz) |
| Maps | Leaflet.js (OpenStreetMap tiles) |
| AQI Data | Open-Meteo Air Quality API |
| Notifications | react-hot-toast |
| Icons | react-icons (Feather Icons) |

---

## Project Structure

```
community-hero/
├── scripts/seed.js          # Database seeding script
├── src/
│   ├── app/
│   │   ├── page.tsx         # Homepage (AQI, tips, features)
│   │   ├── login/           # Login page
│   │   ├── register/        # User registration (with state selection)
│   │   ├── report/          # Issue reporting with AI analysis
│   │   ├── issues/          # Issues list with filters
│   │   ├── issues/[id]/     # Single issue detail page
│   │   ├── map/             # Interactive map view
│   │   ├── dashboard/       # Community insights (AI-powered)
│   │   ├── leaderboard/     # Points ranking
│   │   ├── challenges/      # Daily/weekly challenges
│   │   ├── rewards/         # Points redemption store
│   │   ├── quiz/            # Eco & community quiz
│   │   ├── admin/dashboard/ # Admin issue management panel
│   │   ├── admin/register/  # Admin registration
│   │   └── api/             # API routes
│   │       ├── auth/        # NextAuth + register
│   │       ├── issues/      # CRUD + filtering
│   │       ├── insights/    # AI community insights
│   │       ├── leaderboard/ # Points ranking
│   │       ├── rewards/     # Points & redemption
│   │       └── quiz/        # AI quiz generation
│   ├── components/
│   │   ├── Navbar.tsx       # Navigation (role-aware)
│   │   └── MapView.tsx      # Leaflet map component
│   ├── lib/
│   │   ├── gemini.ts        # Google Gemini AI helpers
│   │   └── mongodb.ts       # MongoDB connection
│   └── models/
│       ├── Issue.ts         # Issue schema
│       └── User.ts          # User schema
```

---

##  Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google AI Studio API key (for Gemini)

### Installation

```bash
git clone <repo-url>
cd community-hero
npm install
```

### Environment Setup

Copy `.env.example` to `.env.local` and fill in:

```env
GOOGLE_AI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
```

### Seed Database

```bash
node scripts/seed.js
```

This creates 5 test citizens, 2 admins, and 6 sample issues with images.

### Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Citizen | ansh@test.com | password123 |
| Citizen | priya@test.com | password123 |
| Admin | admin@municipality.gov | password123 |

---

## ⚠️ Known Limitations

1. **Gemini API quota** — Free tier has rate limits (requests per minute/day). Quiz falls back to hardcoded questions when quota exceeded.

2. **AQI requires location permission** — Falls back to Delhi coordinates if denied.



