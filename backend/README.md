# RishiVerse Module Scaffold

Private **contributor kit** for building modules that integrate into RishiVerse Backend.

This is **not** the full RishiVerse monorepo. It contains:

- Architecture rules (layered API pattern)
- Folder hierarchy matching production
- One runnable **demo** module (`demo/item`) to copy
- Stub Express app so you can develop locally
- Acceptance checklist for handoff

## Quick start

```bash
cp .env.example .env
# set DATABASE_URL to a local Postgres database

npm install
npx prisma generate
# RishiVerse core team runs migrations in production.
# For local kit only, you may use: npx prisma db push

npm run dev
```

Health: `GET http://localhost:3010/health`  
Sample API (no auth in kit): `GET http://localhost:3010/api/v1/demo/item/all`

## How you work

1. Copy `_your_module/` layout (or mirror `demo/`).
2. Build your module under the same layer paths as RishiVerse.
3. Open PRs **in this kit repo** only.
4. Tag a release when ready (e.g. `mymodule-v1.0.0`).
5. RishiVerse maintainers **copy your module folders** into `RishiVerse-Backend` and merge there.

You never get write access to RishiVerse `Master` or production secrets from this kit.

## Docs

| Doc | Purpose |
|-----|---------|
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Day-to-day workflow |
| [ACCEPTANCE_CHECKLIST.md](./ACCEPTANCE_CHECKLIST.md) | Required before handoff |
| [docs/CONTRACTS.md](./docs/CONTRACTS.md) | Shared entities you may reference |
| [docs/HANDOFF.md](./docs/HANDOFF.md) | How code enters RishiVerse |
| [templates/NEW_MODULE.md](./templates/NEW_MODULE.md) | File checklist for a new module |
| `.cursor/rules/` | Cursor rules (same spirit as core repo) |

## Golden example

`demo/item` — create / list / get / update / soft-delete.

Follow **new API** placement:

- Validators → `validators/{module}/`
- Constants → `constants/{module}Constant.js`
- Not legacy `utils/validators/`

## Stack (kit)

- Node 20+, Express, Prisma, Zod, PostgreSQL
