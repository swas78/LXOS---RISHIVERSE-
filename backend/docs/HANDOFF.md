# How code enters RishiVerse

Same path for **every** outsourcing team using this shared kit. See [MULTI_TEAM.md](./MULTI_TEAM.md).

```text
Team builds in rishiverse-backend-module-scaffold (shared)
        ↓
PRs / merges stay in this kit repo (their module only)
        ↓
Team tags a release (e.g. foo-v1.0.0)
        ↓
RishiVerse maintainers copy that module’s paths into RishiVerse-Backend
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
- Other vendors’ modules
- Ad-hoc scripts that don’t belong in production

Merging inside **this** repo does **not** install anything into RishiVerse automatically.
