# New module file checklist

Replace `{module}` and `{entity}` (camelCase entity, kebab-case URL).

```text
prisma/models/{module}/{entity}Model.prisma
constants/{module}Constant.js
validators/{module}/{entity}Schema.js
dals/{module}/{entity}Dal.js
services/{module}/{entity}Service.js
controllers/{module}/{entity}Controller.js
routes/{module}/{entity}Routes.js
routes/{module}Routes.js
# Mount in app.js:
#   authRouter.use('/{module}', {module}Routes)
```

URLs:

- `POST   /api/v1/{module}/{kebab-entity}/new`
- `GET    /api/v1/{module}/{kebab-entity}/all`
- `GET    /api/v1/{module}/{kebab-entity}/:entityId`
- `PATCH  /api/v1/{module}/{kebab-entity}/:entityId`
- `DELETE /api/v1/{module}/{kebab-entity}/:entityId`

Start from `demo/item` and rename.
