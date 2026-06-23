# 🦸 Community Hero - Hyperlocal Problem Solver

An AI-powered platform that enables citizens to identify, report, validate, track, and resolve community issues through collaboration, data, and intelligent automation.

![Community Hero](https://img.shields.io/badge/Powered%20by-Google%20Gemini%20AI-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-green?style=for-the-badge)

## 🌟 Features

### Core Features
- **📸 Image-Based Issue Reporting** - Upload photos of community issues
- **🤖 AI-Powered Analysis** - Google Gemini AI automatically categorizes issues, detects severity, and suggests resolutions
- **📍 Geo-Location** - Capture and display issue locations
- **✅ Community Verification** - Crowd-sourced verification (3+ verifications = confirmed)
- **📊 Real-Time Tracking** - Track issue status from reported → verified → in progress → resolved
- **🏆 Gamification** - Earn points for reporting, verifying, commenting, and resolving issues

### AI Capabilities (Google Gemini)
- **Image Recognition** - Analyze uploaded photos to identify issue type, severity, and impact
- **Auto-Categorization** - Automatically categorize issues into 10+ categories
- **Priority Scoring** - AI assigns priority scores (1-10) based on severity and impact
- **Resolution Suggestions** - AI provides step-by-step resolution recommendations
- **Predictive Insights** - Dashboard shows trending issues, hotspot areas, and predictions
- **Community Health Score** - AI-generated overall community health metric

### Pages
| Page | Description |
|------|-------------|
| `/` | Landing page with features overview |
| `/register` | User registration |
| `/login` | User authentication |
| `/report` | Report new issue with AI image analysis |
| `/issues` | Browse all issues with filters |
| `/issues/[id]` | Issue detail with AI analysis sidebar |
| `/dashboard` | AI-powered insights dashboard |
| `/leaderboard` | Community heroes ranking |

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 15** | Full-stack React framework (App Router) |
| **TypeScript** | Type-safe development |
| **Google Gemini AI** | Image analysis, categorization, insights |
| **MongoDB + Mongoose** | Database for issues and users |
| **NextAuth.js** | Authentication (credentials-based) |
| **Tailwind CSS** | Styling and responsive design |
| **React Hot Toast** | Notifications |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (recommended 20+)
- MongoDB (local or MongoDB Atlas)
- Google AI Studio API Key

### 1. Clone the repository
```bash
git clone https://github.com/Neha-Kumari2311/community-hero.git
cd community-hero
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your:
- **Google AI API Key** - Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **MongoDB URI** - Local or [MongoDB Atlas](https://www.mongodb.com/atlas)
- **NextAuth Secret** - Any random string (use `openssl rand -base64 32`)

### 4. Start MongoDB (if local)
```bash
mongod
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
community-hero/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── issues/        # Issue CRUD + AI analysis
│   │   │   ├── insights/      # AI-powered dashboard data
│   │   │   └── leaderboard/   # User rankings
│   │   ├── dashboard/         # AI insights page
│   │   ├── issues/            # Issues listing & detail
│   │   ├── leaderboard/       # Gamification page
│   │   ├── login/             # Authentication
│   │   ├── register/          # Registration
│   │   ├── report/            # Report issue (with AI)
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── providers.tsx      # Context providers
│   ├── components/
│   │   └── Navbar.tsx         # Navigation bar
│   ├── lib/
│   │   ├── gemini.ts          # Google Gemini AI integration
│   │   └── mongodb.ts         # Database connection
│   └── models/
│       ├── Issue.ts           # Issue schema
│       └── User.ts            # User schema
├── .env.example
├── .env.local
├── package.json
├── tailwind.config.ts
└── README.md
```

## 🤖 How AI is Used (Google AI Studio / Gemini)

### 1. Image Analysis (`/api/issues/analyze`)
When a user uploads a photo:
- Gemini Vision analyzes the image
- Returns: category, severity, description, suggested title, impact, department

### 2. Resolution Suggestions (`/api/issues` POST)
When creating an issue:
- Gemini generates priority score, resolution steps, estimated time, resources needed

### 3. Community Insights (`/api/insights`)
For the dashboard:
- Gemini analyzes all issues to find trends, hotspots, predictions, and recommendations
- Generates community health score (0-100)

## 🎮 Gamification System

| Action | Points |
|--------|--------|
| Report an issue | +10 |
| Verify an issue | +5 |
| Resolve an issue | +25 |
| Add a comment | +2 |

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Environment Variables for Production
```
GOOGLE_AI_API_KEY=your_key
MONGODB_URI=your_atlas_connection_string
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/[...nextauth]` | Login/session |
| GET | `/api/issues` | List issues (with filters) |
| POST | `/api/issues` | Create issue (with AI) |
| GET | `/api/issues/[id]` | Get single issue |
| PATCH | `/api/issues/[id]` | Update (upvote/verify/comment/status) |
| POST | `/api/issues/analyze` | AI image analysis |
| GET | `/api/insights` | AI-generated insights |
| GET | `/api/leaderboard` | User rankings |

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ by [Neha Kumari](https://github.com/Neha-Kumari2311) | Powered by Google Gemini AI
