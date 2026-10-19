# RishiVerse Frontend Module Scaffold

Private **shared contributor kit** for **all outsourcing / external teams** building Next.js UI modules that integrate into `rishiverse-frontend-v2`.

This is **not** the full ERP/LMS frontend. It teaches the same structure, Redux feature pattern, and App Router conventions.

Companion backend kit: `rishiverse-backend-module-scaffold`.

See [docs/MULTI_TEAM.md](./docs/MULTI_TEAM.md).

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3020/demo/item](http://localhost:3020/demo/item)

The demo uses **in-kit API route handlers** (`src/app/api/v1/demo/item`) so you can develop without RishiVerse Backend. Point `NEXT_PUBLIC_API_URL` at a real API when integrating.

## How you work

1. Reserve a unique route/module name with maintainers.
2. Copy `demo/item` (page + feature) — do not invent a parallel architecture.
3. Branch as `feature/<vendor>-<module>-<short-desc>`.
4. Open PRs **in this kit repo** only.
5. Tag a release (e.g. `inventory-ui-v1.0.0`).
6. Maintainers copy your folders into `rishiverse-frontend-v2`.

## Docs

| Doc                                                  | Purpose                         |
| ---------------------------------------------------- | ------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md)                 | App Router, features, data flow |
| [DESIGN.md](./DESIGN.md)                             | UI/UX and form patterns         |
| [RULES.md](./RULES.md)                               | Hard do/don't                   |
| [CONTRIBUTING.md](./CONTRIBUTING.md)                 | Day-to-day workflow             |
| [ACCEPTANCE_CHECKLIST.md](./ACCEPTANCE_CHECKLIST.md) | Handoff gate                    |
| [docs/MULTI_TEAM.md](./docs/MULTI_TEAM.md)           | Multi-vendor model              |
| [docs/HANDOFF.md](./docs/HANDOFF.md)                 | Paths to copy into frontend-v2  |
| [docs/SKILLS.md](./docs/SKILLS.md)                   | Cursor skills                   |
| [templates/NEW_MODULE.md](./templates/NEW_MODULE.md) | File checklist                  |

## Golden example

`demo/item` — list / create / soft-delete style admin CRUD:

- Page: `src/app/(erp)/demo/item/`
- Feature: `src/features/demo/item/` (`types` → `Api` → `Thunks` → `Slice` → `Selectors`)

## Stack (kit)

Next.js 16 · React 19 · TypeScript · Redux Toolkit · Tailwind v4 · Zod · axios · lucide-react
