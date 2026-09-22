---
name: new-rishiverse-module
description: >-
    Scaffolds a new RishiVerse Backend module using the kit layered pattern
    (routes, controller, Zod, service, DAL, Prisma, constants). Use when the
    user asks to create a new module, entity, CRUD API, or to copy demo/item
    into a new domain.
---

# New RishiVerse module

## When to use

Creating a new `{module}` / `{entity}` inside this scaffold (or preparing files for handoff into RishiVerse-Backend).

## Instructions

1. Read [ARCHITECTURE.md](../../ARCHITECTURE.md), [RULES.md](../../RULES.md), and [DESIGN.md](../../DESIGN.md).
2. Use **`demo/item`** as the template — copy and rename; do not invent a new layout.
3. Create these files (camelCase `{entity}`, kebab-case URL segment):

| File                                          |
| --------------------------------------------- |
| `prisma/models/{module}/{entity}Model.prisma` |
| `constants/{module}Constant.js`               |
| `validators/{module}/{entity}Schema.js`       |
| `dals/{module}/{entity}Dal.js`                |
| `services/{module}/{entity}Service.js`        |
| `controllers/{module}/{entity}Controller.js`  |
| `routes/{module}/{entity}Routes.js`           |
| `routes/{module}Routes.js`                    |

4. Mount in `app.js`: `apiRouter.use('/{module}', {module}Routes)`.
5. Endpoints:
    - `POST /api/v1/{module}/{kebab-entity}/new`
    - `GET /api/v1/{module}/{kebab-entity}/all`
    - `GET|PATCH|DELETE /api/v1/{module}/{kebab-entity}/:entityId`
6. Enforce layers:
    - Controller: `schema.parse`, business checks, `handleControllerErrorResponse`
    - Service: `{ success, message, statusCode, data?, pagination? }` only
    - DAL: Prisma + `deletedAt: null` / soft delete
7. Do **not** add Express auth middleware unless asked — document required permissions in handoff notes instead.
8. Do **not** run production migrations; for local kit only, `prisma db push` is allowed.
9. Update a short `docs/{module}.md` endpoint table.
10. Point the user at [ACCEPTANCE_CHECKLIST.md](../../ACCEPTANCE_CHECKLIST.md) before handoff.

## Naming

- Exports: `create{Entity}Controller`, `create{Entity}Service`, `create{Entity}Dal`, `create{Entity}Schema`
- Constants: `{MODULE}_STATUSES`, `{ENTITY}_EDITABLE_FIELDS`
