# DrawSync

**A real-time collaborative whiteboard for teams that think better together.**

## Overview

DrawSync is a real-time collaborative whiteboard web app where multiple users can draw on the same canvas simultaneously, see each other's cursors move live, chat in-room, and organize work into public or private rooms. Drawings persist across refreshes and reconnects, so nothing is lost between sessions. It's built for teams, study groups, or anyone who wants a fast, no-friction shared canvas without setting up a heavyweight design tool.

## Live Demo

> 🔗 **[https://drawsync-io.vercel.app/](https://drawsync-io.vercel.app/)**

## Features

### Real-Time Collaboration
- Instant, synced drawing across all connected users via WebSocket, powered by Excalidraw
- Live cursor presence — see collaborators' names and cursor positions as they draw
- In-room chat alongside the canvas

### Room Management
- Auto-generated, human-readable 3-word room slugs (e.g. `swift-river-cloud`) instead of raw UUIDs
- Public rooms — joinable by any signed-in user with the link
- Private rooms — restricted to the owner and invited collaborators, with email-based invites
- Create, delete (owner only, with confirmation), and leave (collaborators) rooms
- Copy-to-clipboard room slug

### Persistence & Reliability
- Upsert-based save system (by element ID) that survives concurrent multi-user edits without data loss
- Auto-save on every draw action, plus explicit manual save (⌘S or Save button)
- Cold-start handling — animated "waking up" loading state when the free-tier backend needs to spin up, with automatic health-check polling before auth requests are submitted

### Authentication
- Email/password signup and login (bcrypt-hashed passwords)
- Google OAuth 2.0
- JWT-based sessions

### Design
- Custom warm cream / coral / navy editorial aesthetic
- EB Garamond + Inter typography
- Light mode only

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React, TypeScript, Tailwind CSS, Framer Motion, Excalidraw |
| HTTP Backend | Express (TypeScript), REST API, JWT auth |
| WebSocket Backend | Express + `ws` (TypeScript) |
| Database | PostgreSQL + Prisma ORM |
| Auth | Email/password (bcrypt) + Google OAuth 2.0 |
| Monorepo Tooling | Turborepo, pnpm workspaces |
| Deployment | Vercel (frontend), Render (HTTP + WebSocket backends) |

### Architecture

DrawSync is a Turborepo monorepo with three deployed services:

```mermaid
graph TD
    U[User Browser] -->|Loads UI| FE[Frontend<br/>Next.js 15 · Vercel]
    FE -->|REST: auth, rooms, shapes| HTTP[HTTP Backend<br/>Express + JWT · Render]
    FE -->|WebSocket: drawing, cursors, chat| WS[WebSocket Backend<br/>Express + ws · Render]
    HTTP -->|Prisma| DB[(PostgreSQL)]
    WS -->|Prisma| DB
    HTTP -.shares.-> COMMON[packages/common<br/>Zod types]
    WS -.shares.-> COMMON
    FE -.shares.-> COMMON
    HTTP -.shares.-> DBPKG[packages/db<br/>Prisma schema/client]
    WS -.shares.-> DBPKG
```

All three services share `packages/db` (Prisma schema/client) and `packages/common` (shared Zod validation types).

## Metrics

Load tested with custom Node.js scripts (`load-test.js` for WebSocket, `auth-load-test.js` for HTTP auth) against both local dev servers and the deployed production infrastructure (Render free tier). Single test run per environment, single room, one Node process.

### WebSocket real-time layer (`ws-backend`)

| Metric | Local (dev machine) | Production (Render free tier) |
|---|---|---|
| Max stable concurrent connections | 110–120 | 80 |
| Connection count where failures began | 130 (100% failure) | 81 (90% failure) |
| Broadcast latency at 10 concurrent clients (p50 / p95) | 1ms / 1ms | 325ms / 325ms |
| Broadcast latency at ceiling (p50 / p95 / max) | 105ms / 1,372ms / 2,366ms (at 120) | 279ms / 3,014ms / 3,925ms (at 81) |
| Total connection attempts | 132 | 92 |
| Failed connections | 10 | 9 |

### Auth layer (`http-backend` — `/signup` and `/signin`)

**Local**

| Concurrency | Signup p50 / p95 / max | Signin p50 / p95 / max | Failures |
|---|---|---|---|
| 10 | 3,225 / 3,309 / 3,309ms | 1,118 / 1,119 / 1,119ms | 0 |
| 20 | 3,685 / 3,865 / 3,865ms | 1,409 / 1,589 / 1,589ms | 0 |
| 30 | 2,125 / 4,371 / 4,381ms | 2,183 / 2,184 / 2,184ms | 0 |
| 40 | 2,612 / 2,877 / 2,878ms | 2,844 / 2,848 / 2,849ms | 0 |
| 50 | 3,718 / 4,020 / 4,021ms | 3,369 / 3,378 / 3,378ms | 0 |
| 60 | 4,169 / 4,475 / 4,476ms | 3,419 / 3,897 / 3,898ms | 0 |
| 70 *(test auto-stopped)* | 5,049 / 5,335 / 5,336ms | 4,966 / 5,002 / 5,013ms | 0 |

**Production (Render free tier)**

| Concurrency | Signup p50 / p95 / max | Signin p50 / p95 / max | Failures |
|---|---|---|---|
| 2 | 1,370 / 1,370 / 1,370ms | 1,400 / 1,400 / 1,400ms | 0 |
| 4 | 2,407 / 2,502 / 2,502ms | 2,481 / 2,482 / 2,482ms | 0 |
| 6 | 3,389 / 3,393 / 3,393ms | 3,411 / 3,578 / 3,578ms | 0 |
| 8 | 4,470 / 4,575 / 4,575ms | 4,518 / 4,930 / 4,930ms | 0 |
| 10 | 4,975 / 5,664 / 5,664ms | 5,074 / 5,779 / 5,779ms | 0 |
| 12 | 6,094 / 6,810 / 6,810ms | 5,786 / 6,971 / 6,971ms | 0 |
| 14 | 6,783 / 7,961 / 7,961ms | 6,316 / 7,904 / 7,904ms | 0 |
| 16 *(test auto-stopped)* | 7,292 / 9,096 / 9,096ms | 6,885 / 9,083 / 9,083ms | 0 |

**Zero failures were observed at any tested concurrency level, in either environment, for either endpoint.** In every case, the test stopped because response latency crossed the script's threshold — not due to errors or dropped requests.

## Setup / Local Development

**Requirements:** Node.js, pnpm, a running PostgreSQL database.

### 1. Clone the repo

```bash
git clone https://github.com/Bhavysinghal/draw-app.git
cd draw-app
```

### 2. Install dependencies (root, monorepo-wide)

```bash
pnpm install
```

### 3. Set up environment variables

Create the following `.env` files:

**`apps/http-backend/.env`**
```
JWT_SECRET="your-secret-key"
DATABASE_URL="postgresql://user:password@localhost:5432/drawsync"
FRONTEND_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3001/auth/google/callback"
GMAIL_USER="youremail@gmail.com"
GMAIL_PASS="your-gmail-app-password"
```

**`apps/ws-backend/.env`**
```
JWT_SECRET="your-secret-key"
DATABASE_URL="postgresql://user:password@localhost:5432/drawsync"
```

**`apps/frontend/.env.local`**
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="ws://localhost:8080"
```

### 4. Run Prisma migrations

```bash
cd packages/db
npx prisma migrate dev
```

### 5. Start all three services

```bash
cd ../..
pnpm dev
```

This starts:
- Frontend → `http://localhost:3000`
- HTTP backend → `http://localhost:3001`
- WebSocket backend → `ws://localhost:8080`

## Project Structure

```
draw-app/
├── apps/
│   ├── frontend/        # Next.js app
│   ├── http-backend/    # Express REST API
│   └── ws-backend/      # WebSocket server
├── packages/
│   ├── db/               # Prisma schema + client
│   ├── common/           # Shared Zod types
│   ├── backend-common/   # Shared backend config
│   ├── eslint-config/
│   ├── typescript-config/
│   └── ui/
```

## License

All Rights Reserved. This code is public for viewing and portfolio purposes only — see [LICENSE](./LICENSE) for details.
