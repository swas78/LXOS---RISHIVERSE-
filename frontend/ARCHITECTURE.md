# Architecture

How UI modules in this kit map to `rishiverse-frontend-v2`.

## Context

```text
┌──────────────────────────────────────┐
│ rishiverse-frontend-module-scaffold  │  ← you are here
│ demo/ + your module                  │
└──────────────────┬───────────────────┘
                   │ handoff (copy paths)
                   ▼
┌──────────────────────────────────────┐
│       rishiverse-frontend-v2         │
│  (auth) / (erp) / (lms) + features   │
└──────────────────────────────────────┘
```

## Stack

| Layer     | Choice                                                                    |
| --------- | ------------------------------------------------------------------------- |
| Framework | Next.js App Router                                                        |
| UI        | React 19 + Tailwind + shadcn-style `components/ui`                        |
| State     | Redux Toolkit                                                             |
| HTTP      | axios (`@/lib/axios`) + `@/constants/endpoints`                           |
| Forms     | react-hook-form + zod (production); kit demo uses zod + controlled inputs |

## Data flow (mandatory direction)

```text
app/(erp)/…/page.tsx
  → colocated hooks/
  → features/{domain}/*Thunks
  → *Api
  → axios / ENDPOINTS
```

- Pages/components must **not** call `*Api` directly.
- `components/shared` must **not** import `features/`.

## Feature module file order

```text
types.ts → *Api.ts → *Thunks.ts → *Slice.ts → *Selectors.ts
```

In production, domains live under `features/erp/`, `features/lms/`, or `features/configuration/`.  
In this kit, demo lives at `features/demo/item/` for clarity.

## Route folder order

```text
page.tsx → layout.tsx → hooks/ → components/ → schemas/ → utils/
```

Route groups in production: `(auth)`, `(erp)`, `(lms)`. Kit uses a thin `(erp)` shell.

## Component layers

```text
ui/ → shared/atoms/ → shared/molecules/ → shared/organisms/
```

Lower never imports higher. Page-only UI stays next to the route under `components/`.

## `src/` top-level order

```text
app → components → config → constants → contexts → features → hooks
→ lib → mocks → schemas → store → styles → tests → types → utility
```

Do not invent new top-level folders.

## Auth note

Production ERP layout waits for auth hydration and redirects. This kit uses a **stub shell** without JWT. Document required permissions in handoff notes; maintainers wire `useAccessControl` + sidebar entries.
