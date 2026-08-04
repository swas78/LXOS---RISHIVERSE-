# How code enters RishiVerse

```text
You build in rishiverse-module-scaffold
        ↓
PRs / merges stay in this kit repo
        ↓
You tag a release (e.g. foo-v1.0.0)
        ↓
RishiVerse maintainers copy module paths into RishiVerse-Backend
        ↓
Internal PR → review (layer checklist) → merge to test
        ↓
Maintainers run Prisma migrate + deploy
```

## Paths typically copied

```text
routes/{module}/
routes/{module}Routes.js
controllers/{module}/
services/{module}/
dals/{module}/
validators/{module}/
constants/{module}Constant.js
helper/{module}Helper.js          # if present
prisma/models/{module}/
docs/{module}Docs.js              # optional
```

## Not copied

- This kit’s stub `server.js` / demo-only auth gaps
- Your local `.env`
- Ad-hoc scripts that don’t belong in production

Merging inside **this** repo does **not** install anything into RishiVerse automatically.
