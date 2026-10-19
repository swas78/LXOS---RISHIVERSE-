---
name: new-rishiverse-frontend-module
description: >-
    Scaffolds a new RishiVerse frontend UI module using the kit pattern (App
    Router page + Redux feature: types → Api → Thunks → Slice → Selectors). Use
    when the user asks to create a new module, entity CRUD UI, or to copy
    demo/item into a new domain.
---

# New RishiVerse frontend module

## When to use

Creating a new `{module}` / `{entity}` UI in this scaffold (or preparing files for handoff into `rishiverse-frontend-v2`).

## Instructions

1. Read [ARCHITECTURE.md](../../ARCHITECTURE.md), [RULES.md](../../RULES.md), and [DESIGN.md](../../DESIGN.md).
2. Use **`demo/item`** as the template — copy and rename; do not invent a new layout.
3. Create these files (camelCase `{entity}`, kebab-case URL segment):

| File                                                                    |
| ----------------------------------------------------------------------- |
| `src/features/{domain}/{entity}/types.ts`                               |
| `src/features/{domain}/{entity}/{entity}Api.ts`                         |
| `src/features/{domain}/{entity}/{entity}Thunks.ts`                      |
| `src/features/{domain}/{entity}/{entity}Slice.ts`                       |
| `src/features/{domain}/{entity}/{entity}Selectors.ts`                   |
| `src/app/(erp)/{kebab-module}/{kebab-entity}/page.tsx`                  |
| `src/app/(erp)/{kebab-module}/{kebab-entity}/hooks/use{Entity}s.ts`     |
| `src/app/(erp)/{kebab-module}/{kebab-entity}/components/...`            |
| `src/app/(erp)/{kebab-module}/{kebab-entity}/schemas/{entity}Schema.ts` |

4. Add endpoint keys under `src/constants/endpoints.ts`.
5. Register the reducer in `src/store/index.ts`.
6. Enforce data flow: page → hooks → thunks → api → axios. Never page → Api.
7. Optional kit-only mock routes under `src/app/api/v1/...` for local smoke tests — mark them as **not for handoff**.
8. Do **not** add JWT/auth middleware unless asked — document required permissions in handoff notes.
9. Update a short `docs/{module}.md` route table.
10. Point the user at [ACCEPTANCE_CHECKLIST.md](../../ACCEPTANCE_CHECKLIST.md) before handoff.

## Naming

- Feature folder: camelCase entity under agreed taxonomy (`demo`, later `erp` / `configuration` / `lms`)
- Page: `export default function {Entity}Page()`
- Hook: `use{Entity}s` / `use{Entity}Form`
- Thunks: `fetch{Entity}sThunk`, `create{Entity}Thunk`, …
