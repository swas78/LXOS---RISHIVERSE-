# Contributing (kit repo)

This kit is **shared across all outsourcing teams**. Read [docs/MULTI_TEAM.md](./docs/MULTI_TEAM.md).

## Rules of engagement

1. **Only this repo** — develop and PR here (not full RishiVerse-Backend).
2. **Reserve a unique `{module}`** with maintainers before you start.
3. **One module per feature branch** — `feature/<vendor>-<module>-<short-desc>`.
4. **Do not touch other vendors’ modules** or rewrite kit standards/`demo/` without maintainer approval.
5. **Do not commit secrets** — use `.env.example` only.
6. **Schema ≠ migration ownership** — propose Prisma models; core team applies migrations in RishiVerse.
7. **Copy `demo/item`** — do not invent a parallel architecture.

## Layer flow (mandatory)

```
app.js → /api/v1 → routes/{module}Routes.js → routes/{module}/{entity}Routes.js
  → controller → Zod schema.parse() → service → DAL → Prisma
```

Never skip layers. Controllers must not import Prisma. Services must not call `res.json`.

## Naming

| Kind | Pattern |
|------|---------|
| Files | `{entity}Routes.js`, `{entity}Controller.js`, `{entity}Service.js`, `{entity}Dal.js`, `{entity}Schema.js` |
| Exports | `{action}{Entity}Controller`, etc. |
| URLs | `/api/v1/{module}/{kebab-entity}/new` (POST), `/all` (GET), `/:entityId` (GET/PATCH/DELETE) |

## Service result

```js
{ success: boolean, message: string, statusCode: number, data?: any, pagination?: object }
```

## Soft delete

- Reads: `deletedAt: null`
- Deletes: set `deletedAt`, never hard-delete

## Local auth

This kit **does not** include RishiVerse JWT/permission middleware. Your routes are open locally. In production, core will wrap them with auth + `checkPermission` as needed — document required permissions in your handoff notes.
