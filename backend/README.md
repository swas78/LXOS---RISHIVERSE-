# RishiVerse Backend Module Scaffold

Private **shared contributor kit** for **all outsourcing / external teams** building modules that integrate into RishiVerse Backend.

Use **this one repo** as the standard scaffold. Teams do not need the full RishiVerse monorepo. See [docs/MULTI_TEAM.md](./docs/MULTI_TEAM.md).

This is **not** the full RishiVerse monorepo. It contains:

- Architecture, design, and hard rules (`ARCHITECTURE.md`, `DESIGN.md`, `RULES.md`)
- Cursor rules + **project skills** (scaffold, review, handoff)
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

1. **Reserve a unique `{module}` name** with RishiVerse maintainers (avoid clashes with other vendors).
2. Copy `_your_module/` layout (or mirror `demo/`) — do not edit other teams’ modules.
3. Branch as `feature/<vendor>-<module>-<short-desc>`.
4. Open PRs **in this kit repo** only.
5. Tag a release when ready (e.g. `mymodule-v1.0.0`).
6. RishiVerse maintainers **copy your module folders** into `RishiVerse-Backend` and merge there.

You never get write access to RishiVerse `Master` or production secrets from this kit.

## Docs

| Doc | Purpose |
|-----|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Layers, request flow, directory map |
| [DESIGN.md](./DESIGN.md) | API/data design principles |
| [RULES.md](./RULES.md) | Hard do/don't rules |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Day-to-day workflow |
| [ACCEPTANCE_CHECKLIST.md](./ACCEPTANCE_CHECKLIST.md) | Required before handoff |
| [docs/MULTI_TEAM.md](./docs/MULTI_TEAM.md) | Shared kit for multiple outsourcing teams |
| [docs/CONTRACTS.md](./docs/CONTRACTS.md) | Shared entities you may reference |
| [docs/HANDOFF.md](./docs/HANDOFF.md) | How code enters RishiVerse |
| [docs/SKILLS.md](./docs/SKILLS.md) | Cursor project skills index |
| [templates/NEW_MODULE.md](./templates/NEW_MODULE.md) | File checklist for a new module |
| `.cursor/rules/` | Always-on Cursor rules |
| `.cursor/skills/` | Agent skills (new module / review / handoff) |

## Golden example

`demo/item` — create / list / get / update / soft-delete.

Follow **new API** placement:

- Validators → `validators/{module}/`
- Constants → `constants/{module}Constant.js`
- Not legacy `utils/validators/`

## Stack (kit)

- Node 20+, Express, Prisma, Zod, PostgreSQL
