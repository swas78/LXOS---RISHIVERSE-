# Architecture

How modules in this kit map to RishiVerse Backend.

## Context

RishiVerse Backend is a Node/Express + Prisma monolith. External teams build **modules** in this scaffold, then maintainers integrate those folders into the main repo.

```text
┌─────────────────────────────┐
│  rishiverse-backend-module-scaffold │  ← you are here (kit)
│  demo/ + your module        │
└──────────────┬──────────────┘
               │ handoff (copy paths)
               ▼
┌─────────────────────────────┐
│     RishiVerse-Backend      │
│  auth + all domains         │
└─────────────────────────────┘
```

## Request flow

```text
Client
  → server.js / app.js
  → /api/v1
  → routes/{module}Routes.js          (aggregator)
  → routes/{module}/{entity}Routes.js (HTTP verbs)
  → controllers/{module}/{entity}Controller.js
       → validators/... Schema.parse()
       → services/{module}/{entity}Service.js
            → dals/{module}/{entity}Dal.js
                 → Prisma → PostgreSQL
```

In production RishiVerse, `/api/v1` sits behind an **auth router** and often `checkPermission`. This kit omits auth so you can focus on module shape.

## Layers

| Layer | Responsibility | May use | Must not |
|-------|----------------|---------|----------|
| Routes | Wire verbs + logging | Controllers | Zod, Prisma, business rules |
| Controller | Validate, rule checks, HTTP envelope | Schemas, services, `responseUtils` | Prisma |
| Validator | Input shape | Zod | DB, `res` |
| Service | Orchestration, result objects | DALs, helpers | `req`/`res`, Prisma directly |
| DAL | Persistence | Prisma | HTTP |
| Constants | Enums / allow-lists | — | Runtime I/O |
| Helper | Pure/reusable domain helpers | — | Prisma, HTTP |

## Directory map

```text
app.js / server.js
routes/
  {module}Routes.js
  {module}/{entity}Routes.js
controllers/{module}/{entity}Controller.js
services/{module}/{entity}Service.js
dals/{module}/{entity}Dal.js
validators/{module}/{entity}Schema.js
constants/{module}Constant.js
helper/{module}Helper.js          # optional
prisma/
  schema.prisma                   # kit compose root
  models/{module}/{entity}Model.prisma
utils/responseUtils.js
logger/contextLogger.js
```

## Module aggregator pattern

```javascript
// routes/demoRoutes.js
router.use('/item', itemRoutes);

// app.js
apiRouter.use('/demo', demoRoutes);
// → /api/v1/demo/item/...
```

## Service result → HTTP

Services never write HTTP. Controllers:

```javascript
const result = await createItemService(data);
if (!result.success) {
  return res.status(result.statusCode).json({
    success: false,
    message: result.message,
  });
}
return res.status(result.statusCode).json({
  success: true,
  message: result.message,
  data: result.data,
});
```

## Soft delete

```text
CREATE → row with deletedAt = null
READ   → where deletedAt: null
DELETE → update deletedAt = now()
```

## Demo module

`demo/item` implements the full stack for one entity. Treat it as the **canonical architecture sample**.

See also: [DESIGN.md](./DESIGN.md), [RULES.md](./RULES.md), [docs/HANDOFF.md](./docs/HANDOFF.md).
