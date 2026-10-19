# LX frontend scaffold integration plan

Companion to [`lx-scaffold-integration.md`](./lx-scaffold-integration.md) (backend).

---

## What you shipped

A full ERP-looking product under `/lx/**`, talking to `/api/v1/lx/**`:

| UI route                                        | Feature folder                      | Notes                                         |
| ----------------------------------------------- | ----------------------------------- | --------------------------------------------- |
| `/lx/dashboard`                                 | `features/lx/dashboard/`            | Slice-only (axios inside slice)               |
| `/lx/events`, `/lx/events/[id]`                 | `features/lx/event/`                | Full types → Api → Thunks → Slice → Selectors |
| `/lx/rooms`                                     | `features/lx/room/`                 | Full stack                                    |
| `/lx/calendar`                                  | `features/lx/calendar/`             | Slice-only                                    |
| `/lx/clubs`, `/lx/clubs/[id]`                   | `features/lx/club/`                 | Full stack                                    |
| `/lx/clans`, `/lx/clans/[id]`                   | `features/lx/clan/` + `initiative/` | Full stack                                    |
| `/lx/achievements`                              | `features/lx/achievement/`          | Full stack                                    |
| `/lx/products`                                  | `features/lx/product/`              | Full stack                                    |
| `/lx/reimbursements`, `/lx/reimbursements/[id]` | `features/lx/reimbursement/`        | Full stack                                    |
| `/lx/expenses`                                  | `features/lx/expense/`              | Full stack                                    |
| `/lx/budget`                                    | `features/lx/budget/`               | Slice-only                                    |
| `/lx/approvals`                                 | `features/lx/approval/`             | Slice-only                                    |
| `/lx/feed`                                      | `features/lx/feed/`                 | Slice-only                                    |
| `/lx/analytics`                                 | `features/lx/analytics/`            | Slice-only + **page calls axios** for CSV     |
| `/lx/report`                                    | `features/lx/report/`               | Slice-only                                    |
| `/lx/files`                                     | `features/lx/file/`                 | Full stack; no core uploadApi                 |
| `/lx/access`                                    | `features/lx/access/`               | Slice-only                                    |
| (dev only) RoleSwitcher                         | `features/lx/actor/`                | Must not ship                                 |

~17 screens, ~19 Redux slices, colocated page hooks/components, Zod on some
create forms, 300ms debounce on club search.

You followed **the frontend kit’s** pattern (`features/lx/`, stub `(erp)`
shell, `useCan`). Production requires `features/erp/lx/`, `ERPLayout` +
`useAccessControl`, and shared molecules.

---

## Kit vs core

| Concern              | Kit (`rishiverse-frontend-module-scaffold`)                                                   | Production (`rishiverse-frontend-v2`)                                         |
| -------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Feature location     | `src/features/lx/{entity}/`                                                                   | `src/features/erp/{domain}/` (or `lms/` / `configuration/`)                   |
| Store                | `src/store/index.ts` combines reducers                                                        | `src/store/rootReducer.ts` + `store/index.ts`                                 |
| Auth                 | None. `x-lx-user-id` header + localStorage RoleSwitcher                                       | JWT Bearer via `tokenStorage`; `(erp)/layout.tsx` waits for `auth.hydrated`   |
| Permissions          | `useCan()` + custom `PERMISSIONS.CREATE_EVENT` list from `/lx/user/me`                        | `useAccessControl()` + `Model` / `Action` enums                               |
| Nav                  | 17 links inside `app/(erp)/lx/layout.tsx` + RoleSwitcher                                      | `src/config/sidebar/menu.ts` → one ERP parent with children                   |
| Axios base URL       | `NEXT_PUBLIC_API_URL` **already includes** `/api/v1` (default `http://localhost:3010/api/v1`) | `` `${NEXT_PUBLIC_API_URL}/api/v1` `` — env is origin only                    |
| Forms                | Controlled `useState` + `schema.safeParse`                                                    | `react-hook-form` + `@hookform/resolvers/zod` + v3 FormField                  |
| UI                   | One `components/ui/button.tsx`. Raw `<input>`, `<select>`, hex badges                         | shadcn `ui/` + `shared/{atoms,molecules,organisms,v3}`                        |
| Charts               | `recharts` on analytics page                                                                  | **Not a dependency.** `date-fns` is already `^3.6.0`                          |
| Lint                 | `"lint": "next lint"` (broken on Next 16; no eslint config)                                   | `eslint . --max-warnings=0` + prettier                                        |
| Pagination in slices | `totalRecords`                                                                                | Backend LX now emits `totalCount`. Core `buildPaginationMeta` is `totalCount` |
| Data flow            | Page → hooks → thunks → api (mostly)                                                          | Same, mandatory. Pages never import axios                                     |

---

## Collisions with live products

| Surface          | Kit route                                         | Already in v2                                                     | Risk                                                                                   |
| ---------------- | ------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Clubs            | `/lx/clubs`                                       | `/clubs`, `/clubsAdmin`, `features/erp/clubs`                     | URL-safe under `/lx`. Do not reuse reducer key `clubs` — kit uses `lxClub` (keep that) |
| Rooms / bookings | `/lx/rooms`                                       | `/book-venue/**`, `features/erp/book-venue`                       | Parallel “Book Venue”. Keep `/lx/rooms`                                                |
| Calendar         | `/lx/calendar`                                    | Sidebar Calendar → `/comming-soon`; Google agenda under dashboard | `/lx/calendar` is free. Do not steal `/calendar`                                       |
| Achievements     | `/lx/achievements`                                | Public profile / OAA Achievement                                  | Different product if backend coexist holds                                             |
| Uploads          | none dedicated (file confirm hits `/lx/file/new`) | `features/upload/uploadApi.ts` + `ENDPOINTS.UPLOAD.PRESIGNED`     | Reuse core presign. Do not add `/lx/upload`                                            |
| Home             | `app/page.tsx` redirects to `/lx/dashboard`       | Real home / dashboard                                             | **Never copy** root `page.tsx` or kit `(erp)/layout.tsx`                               |

---

## Findings

### Must fix before merge

| Area                        | Kit                                                                                                                                         | Core                                                                                                | What to do                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Auth                        | RoleSwitcher writes `lx-actor-id` to localStorage; axios sends `x-lx-user-id`                                                               | Bearer JWT; no impersonation header                                                                 | Delete `RoleSwitcher`, `features/lx/actor/`, axios interceptor. Do not send `x-lx-*`                                 |
| Auth header even in the kit | Frontend sends `x-lx-user-id`                                                                                                               | Backend scaffold reads `x-lx-actor-ref`                                                             | The two kits do not talk to each other as documented. Production ignores both                                        |
| Permissions                 | `src/hooks/useCan.ts` + `src/lib/permissions.ts` (LX verbs)                                                                                 | `useAccessControl().can(Model.Lx, Action.READ)`                                                     | Delete kit permission files. Gate UI with `Model`/`Action`. Add `Model.Lx` in `types/permissions/types.ts`           |
| Layout                      | `app/(erp)/lx/layout.tsx` is a full sidebar + mobile drawer                                                                                 | `(erp)/layout.tsx` already wraps `ERPLayout`                                                        | **Do not copy** `lx/layout.tsx` or kit `(erp)/layout.tsx`. Pages render inside AppShell                              |
| Feature path                | `src/features/lx/...`                                                                                                                       | New domains nest under `features/erp/`                                                              | Move to `src/features/erp/lx/{entity}/`. Update `@/features/lx/…` imports                                            |
| Store                       | Kit `store/index.ts`                                                                                                                        | Merge **lines** into `rootReducer.ts`                                                               | Register `lxClub`, `lxEvent`, … — never overwrite `clubs` / `roomBooking`                                            |
| Axios instance              | Kit `lib/axios.ts`                                                                                                                          | Production axios + refresh queue                                                                    | **Never copy** kit axios. Merge only `ENDPOINTS.LX` keys                                                             |
| Env URL                     | Kit assumes `NEXT_PUBLIC_API_URL` ends with `/api/v1`                                                                                       | Origin only, client appends `/api/v1`                                                               | After copy, paths in `ENDPOINTS.LX` stay `/lx/...` (no double `/api/v1`)                                             |
| Page → axios                | `analytics/page.tsx` `downloadReport` calls `api.get` for CSV blob                                                                          | Pages dispatch thunks only                                                                          | Move CSV download into `reportApi` + thunk                                                                           |
| Slice owns HTTP             | `analyticsSlice`, `dashboardSlice`, `feedSlice`, `budgetSlice`, `calendarSlice`, `approvalSlice`, `reportSlice`, `accessSlice` import axios | `types → Api → Thunks → Slice`                                                                      | Split each into Api + Thunks + Slice                                                                                 |
| Invalid component folder    | `src/components/lx/` (`RoleSwitcher`, `EntityBlog`)                                                                                         | Only `ui/`, `shared/`, `layout/`                                                                    | Delete RoleSwitcher. Move EntityBlog into `app/(erp)/lx/.../components/` or a shared molecule                        |
| Forms                       | No `react-hook-form`. Manual fields + first Zod issue as a string                                                                           | RHF + v3 FormField                                                                                  | Restamp create/edit forms onto existing drawers/modals                                                               |
| Shared UI                   | Raw inputs, `stone-*`, `shadow-sm`, hardcoded hex on ~15 pages                                                                              | Semantic tokens (`bg-primary`, `text-text-heading`); import search order starts at shared molecules | Replace hex badges with tokens/CVA. Use DataTable / Modal / Button from shared                                       |
| `recharts`                  | Direct dependency; analytics is a client page with four charts                                                                              | Not in `package.json`                                                                               | Do not add unless product agrees. Otherwise rebuild charts with whatever v2 already uses, or a simple table fallback |
| Pagination key              | Every LX slice reads `pagination.totalRecords`                                                                                              | Backend LX now returns `totalCount` (see backend plan)                                              | Map `totalCount` (and keep `totalPages`). Default page size 10, not 12/60                                            |
| Upload                      | `fileApi.create` posts metadata to `/lx/file/new` only                                                                                      | Presign → PUT S3 → persist `s3Path` via `uploadApi.getPresignedUrl`                                 | Wire file / bills / product images / posters through core upload. Delete any kit `uploadApi.ts`                      |
| Lint / format               | `next lint` with eslint-config-next 15 vs next 16; no prettier                                                                              | `npm run lint` + `format:check`, tabWidth from prettier                                             | Reformat on copy; do not copy kit lint config                                                                        |
| Actor bootstrap             | `lx/layout.tsx` dispatches `fetchUsersThunk` + `fetchMeThunk`                                                                               | `/lx/user` is deleted at backend handoff                                                            | Remove. Identity comes from `state.auth`                                                                             |

### Should fix in the same PR

| Area                       | Kit                                             | Core                                                  | What to do                                                                                              |
| -------------------------- | ----------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Route naming               | UI is plural (`/lx/clubs`, `/lx/events`)        | Architecture doc said singular; backend is `/lx/club` | Keep UI plural under `/lx/**` (fine). Do not mount at `/clubs` or `/book-venue`                         |
| List limits                | `useClubs` fetches `limit: 60`                  | Lists paginate (10, hasMore)                          | Use page/limit from URL or shared pagination; don’t fetch-all                                           |
| Debounce                   | Clubs debounce 300ms + abort                    | Kit demo fires per keystroke; you fixed clubs         | Apply the same abort+debounce on events, achievements, files search                                     |
| Charts bundle              | Analytics statically imports `recharts`         | Heavy charts should `dynamic()`                       | If recharts stays, `next/dynamic` it                                                                    |
| `date-fns`                 | Kit `^4.4.0`                                    | v2 already has `^3.6.0` (and `dayjs`)                 | Do not bump date-fns. Prefer existing `dayjs` / date-fns 3                                              |
| Constants merge            | Whole `endpoints.ts` in kit                     | Single `constants/endpoints.ts`                       | Copy **only** the `LX: { ... }` block                                                                   |
| Access page                | Manages `LxMember` roles in-app                 | Core permissions are `PermissionAssignment` / role    | Decide whether LX role overlay UI stays, or admins assign `Model.Lx` in the existing permission console |
| `EntityBlog` / clan colors | Per-clan hex is stored as data (`LxClan.color`) | Brand tokens elsewhere                                | Clan colour as **data** is OK. Status badges should still use tokens                                    |

### Maintainer product decisions

Same set as the backend plan, plus frontend-specific:

1. **Sidebar** — one ERP item “Learner Experience” with children, each `required: { model: Model.Lx, action: Action.READ }` (or finer models).
2. **`Model.Lx` vs per-entity models** — must match backend `PERMISSIONS_MODELS`.
3. **recharts** — add the dep, or name the chart library to use.
4. **Clubs / rooms coexist** — UI already namespaces `/lx/clubs` and `/lx/rooms`. Confirm we do not deep-link into `/clubs` or `/book-venue`.
5. **LX Access screen** — keep as LX-role overlay, or drop and use core permission admin.

### Keep (do not rewrite)

- One-way data flow on the full-stack entities (club, event, room, clan, …).
- `rejectWithValue(extractApiErrorMessage(...))` in thunks.
- `toast.success` / `toast.error` (sonner) in slices on mutations.
- Debounced search + `promise.abort()` on clubs.
- Reducer keys `lxClub`, `lxRoom`, `lxEvent`, … — you do not collide with `clubs` / `roomBooking`.
- Routes under `/lx/**` (not `/clubs` / `/book-venue`).
- `--primary: #b61d45` matches production brand. Token _name_ is fine; do not copy kit `globals.css`.
- No extra top-level `src/` folders besides the invalid `components/lx`.
- Zod schemas colocated under route `schemas/` (move toward RHF, keep the schemas).

---

## Copy map

### Copy, then restamp

| Path                                      | Notes                                                             |
| ----------------------------------------- | ----------------------------------------------------------------- |
| `src/app/(erp)/lx/**` except `layout.tsx` | Keep pages/hooks/components/schemas. Drop the LX sidebar layout   |
| `src/features/lx/{entity}/`               | Move to `src/features/erp/lx/{entity}/`. Split slice-only modules |
| `ENDPOINTS.LX` keys                       | Merge into `src/constants/endpoints.ts`                           |
| Reducer lines                             | Merge into `src/store/rootReducer.ts` (`lxClub`, `lxEvent`, …)    |
| Route-local `schemas/`                    | Keep; wire through RHF                                            |

### Never copy

| Path                                            | Why                                                     |
| ----------------------------------------------- | ------------------------------------------------------- |
| `src/app/page.tsx`                              | Redirects the whole app to `/lx/dashboard`              |
| `src/app/(erp)/layout.tsx`                      | Stub header. Production already has auth + `ERPLayout`  |
| `src/app/(erp)/lx/layout.tsx`                   | Duplicate sidebar + RoleSwitcher                        |
| `src/app/layout.tsx`, `globals.css`             | Kit shell / tokens. Production owns these               |
| `src/lib/axios.ts`                              | Actor header, wrong baseURL shape, no refresh           |
| `src/hooks/useCan.ts`, `src/lib/permissions.ts` | Parallel RBAC. Use `useAccessControl`                   |
| `src/components/lx/RoleSwitcher.tsx`            | Explicitly must not ship                                |
| `src/features/lx/actor/`                        | Dev user switcher + `/lx/user`                          |
| `src/app/api/v1/**`                             | Demo mock route handlers                                |
| `src/store/index.ts` as a file                  | Would wipe the real store. Merge reducer **lines** only |
| `package.json` / eslint config                  | `next lint`, recharts, date-fns 4                       |

---

## Target data flow

**Kit today**

```text
/lx/* page
  → colocated hooks
  → features/lx/*Thunks (or axios inside *Slice)
  → kit axios + x-lx-user-id
  → /api/v1/lx/...
```

**v2 after integration**

```text
(erp)/layout  →  wait auth.hydrated  →  ERPLayout (sidebar from menu.ts)
  → /lx/* page
  → hooks (useAccessControl for buttons)
  → features/erp/lx/*Thunks
  → *Api
  → production axios (Bearer) + ENDPOINTS.LX
  → /api/v1/lx/...
Uploads: uploadApi.getPresignedUrl → PUT S3 → persist s3Path on LX entity
```

---

## Suggested sidebar (for `menu.ts`)

One parent, not 17 top-level items. Gate children with `Model.Lx` (or the grain you pick):

```text
Learner Experience          icon: (pick from iconMap or add one)
  Dashboard                 /lx/dashboard
  Events                    /lx/events
  Rooms                     /lx/rooms
  Calendar                  /lx/calendar
  Clubs                     /lx/clubs
  Clans                     /lx/clans
  Achievements              /lx/achievements
  Products                  /lx/products
  Reimbursements            /lx/reimbursements
  Expenses                  /lx/expenses          (CREATE or UPDATE)
  Budget                    /lx/budget            (Finance / UPDATE)
  Approvals                 /lx/approvals         (UPDATE)
  Feed                      /lx/feed
  Analytics                 /lx/analytics         (READ + finance)
  Files                     /lx/files
```

`activeMatch: "^/lx"` on the parent. Do not register `/clubs` or `/book-venue` as LX.

---

## Integration sequence

1. **Lock the same product decisions as backend** — clubs/rooms coexist, `Model.Lx` grain, recharts yes/no.
2. **Add `Model.Lx` (and actions)** in `src/types/permissions/types.ts` to match backend.
3. **Move features** `src/features/lx/` → `src/features/erp/lx/`. Split slice-only modules. Fix pagination to `totalCount`.
4. **Copy pages** under `src/app/(erp)/lx/` **without** `layout.tsx`. Delete RoleSwitcher / `components/lx` / actor feature.
5. **Merge** `ENDPOINTS.LX` and reducer keys. Do not copy axios or store files.
6. **Sidebar** — one parent + children in `menu.ts`. Add `iconMap` entry if needed.
7. **Restamp UI** — RHF + shared molecules + semantic tokens. Move analytics CSV off the page.
8. **Uploads** — bills, posters, product images, files go through `features/upload/uploadApi.ts`.
9. `npm run lint` && `npm run type-check` && `npm run format:check`.

---

## Env vars (names only)

| Name                          | Handoff                                                 |
| ----------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`         | Already in v2 (origin, **not** including `/api/v1`)     |
| `NEXT_PUBLIC_LX_COLLECT_BANK` | **Do not ship.** Kit-only; backend flag must stay false |

No other frontend env vars. Google client id is unrelated.

---

## Kit defects that affect delivery

These were already noted in the vendor’s `docs/lx/ARCHITECTURE.md` §12.4:

- Frontend `npm run lint` is broken on Next 16 (`next lint` removed; eslint-config-next pinned to 15).
- `next dev` can generate untracked `AGENTS.md` / `CLAUDE.md` in the kit root.
- **New:** actor header name disagrees with the backend kit (`x-lx-user-id` vs `x-lx-actor-ref`).
- **New:** slices still read `totalRecords` after the backend kit switched to `totalCount`.
- **New:** analytics page calls axios; several modules skip `*Api.ts`.

---

## Suggested first implementation slice

Once `Model.Lx` and the club/room decision are locked:

1. Move/register store + endpoints (no UI).
2. Dashboard + events pages inside existing `ERPLayout` (proves auth, sidebar, data flow).
3. Then clubs / rooms (collision-sensitive).
4. Then money (reimbursements/expenses) with core upload + no bank fields.
