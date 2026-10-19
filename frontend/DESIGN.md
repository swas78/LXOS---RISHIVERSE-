# Design

Design principles for frontend modules built in this kit.

## Goals

1. **Same shape as production** — App Router + Redux feature modules.
2. **One-way data flow** — UI → hooks → thunks → api → HTTP.
3. **Reusable UI in shared/, page UI colocated** — don’t dump Redux into shared.
4. **Safe outsourcing** — no full monorepo required.

## Screens

- Prefer **admin CRUD** patterns: filters + table/cards + create/edit drawer/modal.
- Keep first viewport focused; avoid dashboard clutter on feature pages.
- Use existing shared molecules (DataTable, Modal, etc.) in production; kit ships minimal stand-ins.

## Forms

- Validate with **Zod** schemas colocated under the route `schemas/` (or shared `src/schemas/`).
- In production, prefer `react-hook-form` + `@hookform/resolvers/zod`.
- Surface API errors via toasts (`sonner` in production) and rejectWithValue messages.

## API contract

Assume backend envelopes:

```json
{ "success": true, "message": "...", "data": {}, "pagination": {} }
```

Map list `data` + `pagination` into Redux slice state. Don’t invent ad-hoc response shapes without maintainer approval.

## Permissions & nav

- Gate actions with `Model` / `Action` in production (`useAccessControl`).
- Add sidebar entries in `src/config/sidebar/menu.ts` during integration (not always in kit).

## Env

| Name                           | Purpose                      |
| ------------------------------ | ---------------------------- |
| `NEXT_PUBLIC_API_URL`          | API base ending in `/api/v1` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth (production)    |

Never commit secrets. Kit demo can run against local route handlers without a real backend.

## Reference

`demo/item` is the UI golden example — mirror specialization / academic-year CRUD from frontend-v2.
