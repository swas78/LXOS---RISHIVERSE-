---
name: rishiverse-module-handoff
description: >-
  Prepares a vendor module for integration into RishiVerse-Backend: release tag
  notes, paths to copy, env vars, Prisma models, and acceptance checklist.
  Use when the user asks to hand off, release, or integrate a module.
---

# RishiVerse module handoff

## When to use

Module is feature-complete in this kit and ready for maintainers to copy into RishiVerse.

## Instructions

1. Run through [ACCEPTANCE_CHECKLIST.md](../../ACCEPTANCE_CHECKLIST.md) — list any unchecked items.
2. Produce a **Handoff summary** markdown:

```markdown
## Module
- Name: `{module}`
- Entities: ...
- Suggested tag: `{module}-vX.Y.Z`

## Paths to copy into RishiVerse-Backend
- routes/{module}/
- routes/{module}Routes.js
- controllers/{module}/
- services/{module}/
- dals/{module}/
- validators/{module}/
- constants/{module}Constant.js
- helper/{module}Helper.js   # if any
- prisma/models/{module}/
- docs/...

## Prisma
- Models / enums added:
- Indexes / uniques:

## Env vars (names only)
- FOO_BAR=

## Permissions (if any)
- model / actions expected

## Endpoints
| Method | Path | Notes |
|--------|------|-------|

## Dependencies beyond Express/Prisma/Zod
- ...

## Test notes
- How to smoke-test locally
- Known limitations (auth not in kit, etc.)
```

3. Remind maintainers: merge in kit ≠ install; they open an internal PR, review with the **rishiverse-api-layer-review** skill, then migrate.
4. Do not push to RishiVerse remotes from this skill unless the user explicitly asks and has access.
