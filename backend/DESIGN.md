# Design

Design principles for modules built in this kit and integrated into RishiVerse Backend.

## Goals

1. **Predictable modules** — every feature looks like every other feature (same folders, same flow).
2. **Safe integration** — vendors can ship a module without holding the full monorepo.
3. **Clear ownership** — HTTP shaping vs business rules vs persistence are never mixed.
4. **Reversible change** — soft-delete and review-friendly APIs beat silent hard deletes.

## API design

### URL shape

```text
/api/v1/{module}/{kebab-entity}/new     POST
/api/v1/{module}/{kebab-entity}/all     GET
/api/v1/{module}/{kebab-entity}/:id     GET | PATCH | DELETE
```

- Version under `/api/v1`.
- Module is a bounded domain (`demo`, later `inventory`, `hostel`, …).
- Entity path is kebab-case; IDs are path params.

### Response envelope

Always return a consistent JSON envelope:

**Success**

```json
{
  "success": true,
  "message": "Item created successfully",
  "data": {},
  "pagination": { "page": 1, "limit": 10, "totalRecords": 0 }
}
```

(`pagination` only on list endpoints.)

**Failure**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "path": ["title"], "message": "title is required" }]
}
```

Clients (and QA) should not need per-endpoint response shapes.

### Validation

- **Zod at the controller boundary** — `schema.parse(req.body)` / `schema.parse(req.query)`.
- Validators describe **shape and types**, not business policy (“only one ACTIVE year”).
- Business rules live in the **controller** (orchestration checks) or **service** (domain decisions).

### Idempotency & deletes

- Prefer **soft delete** (`deletedAt`) for domain rows.
- List/get endpoints ignore soft-deleted rows (`deletedAt: null`).
- Do not invent hard-delete unless maintainers explicitly approve.

## Data design

### Prisma models

- Put proposed models under `prisma/models/{module}/`.
- Include `createdAt`, `updatedAt`, and usually `deletedAt`.
- Use enums for closed status sets; document values in `constants/{module}Constant.js`.

### Constants

- Enums, editable field lists, and select/sort allow-lists belong in constants — not scattered magic strings.

## Local kit vs production

| Concern | Kit | RishiVerse |
|---------|-----|------------|
| Auth / permissions | Stub / open | JWT + `checkPermission` |
| Migrations | Local `db push` OK | Maintainers run migrate |
| Logging | Console stub | Shared context logger |
| Secrets | `.env.example` only | Org secrets / vault |

Design your module as if auth will wrap it later: keep controllers thin and free of “fake admin” shortcuts.

## Extensibility

- New behaviour = new files in the layer tree, not helpers dumped in `app.js`.
- Cross-module calls go **service → service** (or documented events), never DAL → DAL across domains without review.
- If you need a core table column (`Student`, `User`), **request a contract change** — do not redefine core schemas here.

## Reference implementation

`demo/item` is the design reference: CRUD + soft-delete + Zod + pagination + layered files.

Copy it. Do not invent a parallel style.
