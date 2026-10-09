# Progressly – Social Progress Tracking Platform

**Stack: MongoDB · Express.js · React · Node.js · Redis · JWT · Docker**

Progressly is a full-stack MERN application where users create their own custom trackable metrics (e.g. study hours, LeetCode problems, workout reps), log daily entries, visualise their progress over time, and share their progress with others via a social feed and public profiles.

---

## Features

### Authentication
- Register and login with email + password
- Passwords hashed with **bcrypt** (salt rounds: 12)
- **JWT** issued on login, stored in an **HttpOnly cookie** (not accessible to JS — XSS safe)
- Auth middleware verifies the cookie on every protected route
- Logout clears the cookie server-side

### Custom Metrics & Unique Data Types
- Users define unique trackable entities with custom data types:
  - **`number`**: Decimal/Float (e.g. Study Hours, Running km, Weight)
  - **`count`**: Integer counts (e.g. LeetCode Problems, Gym Reps, Book Pages) with quick increment buttons (+1, +5, +10)
  - **`boolean`**: Habit tracker (Yes/No completion, e.g. Daily Meditation, Cold Shower) with 1-click completion
  - **`duration`**: Time in minutes (e.g. Focus work, Meditation) with quick time increments (+15m, +30m, +60m)
- Each metric has a user-defined `name`, `unit`, `type`, and `color`
- **Full Metric CRUD**: Edit metric name, unit, color, type, or public visibility at any time
- **Entry CRUD**: Add, edit, or delete individual logged entries

### Daily Logging & Stats
- Log a value + date + optional note tailored to the metric type
- Stats computed server-side per metric:
  - **Streak** — consecutive days logged up to today
  - **Total** — sum of all entries (or completed days for habits)
  - **Average** — mean value per logged day

### Graphs, Heatmaps & Visualisations
- **GitHub / LeetCode-style Contribution Heatmap** — 52-week calendar grid visualizing daily activity density and frequency
- **Line chart** on metric detail page (progress over time) — Chart.js via `react-chartjs-2`
- **Bar chart** on public profiles (recent 14 entries overview)
- Entry history table with editable entries and delete options

### Social Platform & Feed
- **Search Users**: Find other players by name via `/search`
- **Follow / Unfollow**: Follow other users and track follower counts
- **Social Home Feed**: Real-time home feed showing recent activity and progress logs from all followed accounts
- **Public Profiles**: Every user gets a shareable profile URL (`/profile/:userId`) displaying their public metrics and activity heatmaps

### Redis Caching
- Public profile data is cached in Redis with a **60-second TTL**
- Cached responses include a `"fromCache": true` flag
- App gracefully degrades if Redis is unavailable (lazy connect — no crashes)

### Docker
- Each service is containerised independently
- `docker-compose.yml` orchestrates **Redis**, **Express server**, and **React client**
- Redis hostname resolves automatically via Docker service name

---

## Project Structure

```
Progressly/
├── docker-compose.yml
├── package.json              # root — runs both server + client with concurrently
│
├── server/
│   ├── config/
│   │   ├── db.js             # MongoDB connection
│   │   └── redis.js          # ioredis client (lazy connect, offline safe)
│   ├── controllers/
│   │   ├── authController.js # register, login, logout
│   │   ├── userController.js # search, follow/unfollow, feed
│   │   └── metricController.js # metrics CRUD, entries CRUD, stats, public profile
│   ├── middlewares/
│   │   └── authmiddleware.js # JWT cookie verification
│   ├── models/
│   │   ├── userSchema.js     # User (name, email, password, isPublic)
│   │   ├── followSchema.js   # Follower / following relationship
│   │   ├── metricSchema.js   # Metric — flexible entity with unique data types
│   │   └── entrySchema.js    # Entry — daily log for a metric
│   ├── routes/
│   │   ├── authRoutes.js     # POST /api/auth/register|login|logout
│   │   ├── userRoutes.js     # GET  /api/me/profile
│   │   ├── userSocialRoutes.js # search, follow, unfollow, feed
│   │   ├── metricRoutes.js   # CRUD /api/metrics, entries, stats
│   │   └── profileRoutes.js  # GET  /api/profile/:userId (public, cached)
│   ├── Dockerfile
│   └── .env
│
└── client/
    ├── src/
    │   ├── App.jsx            # routing + auth state
    │   ├── components/
    │   │   ├── Navbar.jsx     # Feed, My Metrics, Search navigation
    │   │   └── Heatmap.jsx    # GitHub/LeetCode-style 52-week activity calendar
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Register.jsx
    │       ├── Feed.jsx       # Social home feed of followed users
    │       ├── Search.jsx     # User discovery and search
    │       ├── Dashboard.jsx  # Templates, metrics list + creator
    │       ├── MetricDetail.jsx # Chart, Heatmap, History tabs + edit modal
    │       └── PublicProfile.jsx # Shareable profile with follow button + heatmaps
    ├── vite.config.js         # proxy /api → localhost:5000
    └── Dockerfile
```

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login, set JWT cookie |
| POST | `/api/auth/logout` | ❌ | Clear JWT cookie |
| GET | `/api/me/profile` | ✅ | Get logged-in user info |
| GET | `/api/metrics` | ✅ | List user's metrics |
| POST | `/api/metrics` | ✅ | Create a metric (supports `type`) |
| PUT | `/api/metrics/:id` | ✅ | Update metric details / type / visibility |
| DELETE | `/api/metrics/:id` | ✅ | Delete metric + all entries |
| GET | `/api/metrics/:id/entries` | ✅ | List entries for a metric |
| POST | `/api/metrics/:id/entries` | ✅ | Log a new entry |
| PUT | `/api/metrics/:id/entries/:entryId` | ✅ | Edit an existing entry |
| DELETE | `/api/metrics/:id/entries/:entryId` | ✅ | Delete an entry |
| GET | `/api/metrics/:id/stats` | ✅ | Streak, total, avg + entries |
| GET | `/api/profile/:userId` | ❌ | Public profile (Redis cached) |
| GET | `/api/users/search?q=` | ✅ | Search users by name |
| GET | `/api/users/feed` | ✅ | Social feed of followed users' logs |
| POST | `/api/users/:id/follow` | ✅ | Follow a user |
| DELETE | `/api/users/:id/follow` | ✅ | Unfollow a user |
| GET | `/api/users/:id/follow-status` | ✅ | Get follow status & follower count |

---

## Running Locally (Dev)

**Prerequisites:** Node.js 20+, MongoDB Atlas URI (already in `.env`)

```bash
# Install all dependencies
cd server && npm install
cd ../client && npm install
cd ../ && npm install

# Run both server + client together
npm run dev
```

- Server: `http://localhost:5000`
- Client: `http://localhost:5173`

> Redis is optional for local dev — the app works without it, caching is just skipped.

### Run Redis locally (optional)
```bash
docker run -p 6379:6379 redis:7-alpine
```

---

## Running with Docker

```bash
docker-compose up --build
```

This starts:
- **Redis** on port 6379
- **Express server** on port 5000
- **React client** on port 5173

> Set `MONGO_URI` and `JWT_SECRET` in `server/.env` before building.
