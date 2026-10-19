---
name: rishiverse-frontend-module-handoff
description: >-
    Prepares a vendor UI module for integration into rishiverse-frontend-v2:
    release tag notes, paths to copy, env vars, sidebar/permissions, and
    acceptance checklist. Use when the user asks to hand off, release, or
    integrate a frontend module.
---

# RishiVerse frontend module handoff

## When to use

Module is feature-complete in this kit and ready for maintainers to copy into `rishiverse-frontend-v2`.

## Instructions

1. Run through [ACCEPTANCE_CHECKLIST.md](../../ACCEPTANCE_CHECKLIST.md) — list any unchecked items.
2. Produce a **Handoff summary** markdown:

```markdown
## Module

- Name: `{module}`
- Routes: ...
- Suggested tag: `{module}-ui-vX.Y.Z`

## Paths to copy into rishiverse-frontend-v2

- src/app/(erp)/{module}/...
- src/features/{taxonomy}/{entity}/...
- src/constants/endpoints.ts # merge keys only
- src/store/… # merge reducer line only

## Do NOT copy

- src/app/api/v1/... kit mock handlers (unless explicitly agreed)
- kit stub layouts that replace production auth shell

## Env vars (names only)

- NEXT_PUBLIC_API_URL=

## Permissions / sidebar

- Models/actions expected
- Suggested menu label + href

## Backend contract

| Method | Path | Notes |
| ------ | ---- | ----- |

## Dependencies beyond Next/RTK/axios/zod

- ...

## Test notes

- How to smoke-test locally
- Known limitations (auth not in kit, etc.)
```

3. Remind maintainers: merge in kit ≠ install; they open an internal PR, review with the **rishiverse-frontend-layer-review** skill, then wire sidebar + access control.
4. Do not push to `rishiverse-frontend-v2` remotes from this skill unless the user explicitly asks and has access.
