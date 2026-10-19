# LXOS — Learner Experience OS (RishiVerse)

Full-stack Learner Experience Operating System engineered for Rishihood University's ERP/LMS ecosystem.

## Repository Architecture

```text
LXOS---RISHIVERSE-/
├── backend/          # Node.js 20+, Express 4, Prisma 6, PostgreSQL REST API
└── frontend/         # Next.js 16 (App Router), React 19, Redux Toolkit, Tailwind CSS v4
```

## Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Set your DATABASE_URL in .env
npx prisma generate
npx prisma db push
node scripts/seed.js
npm run dev
```
Backend runs on `http://localhost:3010`.

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:3010/api/v1
npm run dev
```
Frontend runs on `http://localhost:3020`.
