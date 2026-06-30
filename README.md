# 🦉 ITXStudie

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white"/>
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white"/>
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL_16-316192?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white"/>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img alt="Zustand" src="https://img.shields.io/badge/Zustand-orange?style=for-the-badge"/>
</p>

> A personal **fullstack study tracker** — built to log, organize, and visualize study sessions with fully customizable Study/Break cycles.

---

## ✨ Features

- 📂 **Categories & Topics** — Organize your subjects into categories and break them down into specific topics
- ⏱️ **Session Timer** — Start and stop study sessions linked to any topic
- 🔄 **Study Circles** — Fully customizable timed cycles (Pomodoro-style): define as many phases as you want, alternating Study/Break with free durations
- 🎡 **CycleWheel** — Animated visualization of progress within a cycle
- 📊 **History** — Persistent log of all sessions with date, duration, and topic *(in development)*
- 📈 **Analytics** — Hours-per-subject dashboard *(planned)*

---

## 🏗️ Architecture

```
ITXStudie/
├── backend/    → NestJS + Prisma ORM + PostgreSQL  (port 3001)
└── frontend/   → Next.js 16 (App Router) + Zustand (port 3000)
```

### Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Zustand |
| Backend | NestJS, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| HTTP Client | Axios |
| DB Container | Podman (or Docker) |

---

## 🚀 Local Setup

### Prerequisites

- [Node.js](https://nodejs.org) v20+
- [Podman](https://podman.io) or Docker
- npm

### 1. Clone the repository

```bash
git clone https://github.com/ITX-Duda/ITXStudie.git
cd ITXStudie
```

### 2. Start the PostgreSQL database

```bash
# With Podman
podman run -d \
  --name itxstudie-postgres \
  -e POSTGRES_USER=itxstudie \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=itxstudie_db \
  -p 5432:5432 \
  postgres:16-alpine

# Or with Docker
docker run -d \
  --name itxstudie-postgres \
  -e POSTGRES_USER=itxstudie \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=itxstudie_db \
  -p 5432:5432 \
  postgres:16-alpine
```

### 3. Set up the backend

```bash
cd backend

# Copy the environment template and adjust if needed
cp ../.env.example .env
# → Edit DATABASE_URL if your credentials differ

npm install
npx prisma migrate deploy   # applies all migrations
npm run start:dev           # server running on port 3001
```

### 4. Set up the frontend

```bash
cd ../frontend

# Create the local environment file
echo 'NEXT_PUBLIC_API_URL=http://localhost:3001' > .env.local

npm install
npm run dev                 # app running on port 3000
```

### 5. Open the app

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API — Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Server health check |
| POST | `/sessions/start` | Start a session |
| PATCH | `/sessions/:id/stop` | Stop a session |
| GET | `/sessions/user/:userId` | List user sessions |
| POST | `/categories` | Create a category |
| GET | `/categories/user/:userId` | List user categories |
| POST | `/topics` | Create a topic |
| GET | `/topics/user/:userId` | List user topics |
| POST | `/circles` | Create a Study Circle |
| GET | `/circles/user/:userId` | List user circles |
| GET | `/circles/:id` | Get circle details |
| DELETE | `/circles/:id` | Delete a circle |
| POST | `/circles/:id/run` | Start a circle run |
| GET | `/circles/runs/:runId` | Get current run state |
| PATCH | `/circles/runs/:runId/next` | Advance to the next phase |
| PATCH | `/circles/runs/:runId/abandon` | Abandon the run |

---

## 🗺️ Roadmap

### ✅ Phase 1 — Alpha (completed)
- [x] Fullstack architecture (NestJS + Next.js + Prisma)
- [x] Full schema: User, Session, Category, Topic, StudyCircle, CirclePhase, CircleRun
- [x] All API endpoints
- [x] Study Circles with animated CycleWheel
- [x] Per-phase timer with auto-advance

### 🔧 Phase 2 — Auth & Quality
- [ ] JWT authentication (signup/login)
- [ ] Protected routes on the frontend
- [ ] Categories and Topics pages with full CRUD
- [ ] Session history on the dashboard
- [ ] Mobile responsiveness

### 📱 Phase 3 — PWA & Multi-device
- [ ] Progressive Web App (installable on phone/tablet)
- [ ] Remote access via Tailscale (no hosting costs)
- [ ] End-of-phase notifications

### 📊 Phase 4 — Analytics & ML
- [ ] Hours-per-subject dashboard (Recharts)
- [ ] Data export (CSV/JSON)
- [ ] Study schedule recommendation model (FastAPI + Python)

---

## 📁 Folder Structure

```
ITXStudie/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         ← database models
│   │   └── migrations/
│   └── src/
│       ├── categories/           ← categories module
│       ├── circles/              ← Study Circles module
│       ├── sessions/             ← sessions module
│       ├── topics/               ← topics module
│       └── prisma/               ← Prisma singleton service
├── frontend/
│   └── src/
│       ├── app/                  ← routes (App Router)
│       │   ├── circles/          ← circle list and execution
│       │   └── page.tsx          ← main dashboard
│       ├── components/
│       │   ├── circles/          ← CircleBuilder, CircleCard, CircleRunner, CycleWheel
│       │   └── timer/            ← standalone timer component
│       ├── lib/
│       │   └── api.ts            ← centralized Axios client
│       └── store/                ← Zustand stores (user, session, circle)
├── scripts/
│   └── seed-cronograma.js        ← sample data seed
└── .env.example                  ← environment variables template
```

---

## 📝 License

Personal project developed as a learning journey into fullstack architecture.

---

*Built by Duda — as a study of software, productivity, and code.*
