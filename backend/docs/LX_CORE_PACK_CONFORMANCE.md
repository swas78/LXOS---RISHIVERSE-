# LX module — conformance with `lxos-core-pack`

This document answers one question for a RishiVerse maintainer: **can the LX
module's schema be dropped into core without collisions, and what is still
open?**

It maps every requirement in `lxos-core-pack` to what the module actually does.
Where the module deliberately diverges, that is called out with the reason.

---

## 1. Schema composition — DONE

`prisma/` is a real Prisma multi-file schema (Prisma ≥ 6), not a single file
with a documentation mirror beside it.

```text
prisma.config.ts               schema: 'prisma'      ← mirrors core
prisma/schema.prisma           generator + datasource ONLY
prisma/models/demo/*.prisma    scaffold sample
prisma/models/lx/*.prisma      ← THE HANDOFF ARTEFACT (13 models, 17 enums)
```

**Handoff is a directory copy:** drop `prisma/models/lx/` into core's
`prisma/models/lx/`. No edit to core's root `schema.prisma`, no include list,
no 21-model paste.

After copying: `npx prisma generate` only. Do **not** run `migrate dev` /
`db push` — maintainers author and apply the migration.

The kit's `prisma.config.ts` imports `dotenv/config` because a Prisma config
file disables implicit `.env` loading. Core does not need that line; drop it.

### Prefix gate

| Check                                                                       | Result      |
| --------------------------------------------------------------------------- | ----------- |
| Models + enums under `prisma/models/lx/`                                    | 30          |
| …of those, `Lx`-prefixed                                                    | **30**      |
| Models with `@@map("lx_…")`                                                 | **13 / 13** |
| Prohibited core names redeclared (`User`, `Club`, `Room`, `Achievement`, …) | **0**       |

---

## 2. Identity — DONE (with one deliberate divergence)

LXOS declares **no user table**. `LxMember` is the LX _overlay_ on core
identity: `referenceId` + `role` + optional `clubId`/`clanId`.

Every person-reference in every other LX table is a `*ByRef` column holding
core `User.referenceId` — a student's `enrollmentNo` or an employee's
`employeeId`. There are no local user ids anywhere in the module.

```prisma
model LxMember {
  referenceId String       @unique   // core User.referenceId
  role        LxMemberRole            // NOT core's Role enum
  clubId      String?
  clanId      String?
}
```

**Requested core edit** (maintainers only — deliberately not shipped):

```prisma
// prisma/models/lx/memberModel.prisma
user User @relation(fields: [referenceId], references: [referenceId])
// core User needs the back-relation:
lxMember LxMember?
```

### Divergence: `*ByName` columns retained as caches

The core pack says do not store `fullName` on LX rows. The module keeps
`createdByName`, `approvedByName`, … but **only** under the escape hatch the
pack itself allows ("store it as a cache with a comment that it can drift").

Every such column carries a `/// CACHE — may drift` doc comment, and
`services/lx/identityService.js` is the read-time resolver the pack asks for —
**one batched lookup per page of rows**, never a query per row:

```js
import { hydrateNames } from "./identityService.js";
const rows = await hydrateNames(await someDal()); // one query, N rows
```

**To finish the job at handoff:** replace the body of `fetchNames()` in that
file with core's batched `prisma.user.findMany({ referenceId: { in: refs } })`
(the exact query is in the file header). Callers do not change. Then either
keep the caches as caches, or drop the columns entirely — the resolver already
makes them redundant.

`identityService.fetchNames` never selects `Student.bank*`.

---

## 3. Payouts (D3) — DONE, flag-gated

`payoutRef` is the canonical payout destination: `student-bank:<enrollmentNo>`.
Finance resolves the real account from `Student.bank*` in the core UI. LXOS
records _which person_ to pay, not their credentials.

`payoutTxnRef` (new) holds the bank/UPI reference Finance captures once an
approved claim is actually paid.

### The `bankDetails` column — removed

`LxReimbursement.bankDetails` and the `LX_COLLECT_BANK` flag that gated it have
been **deleted outright** — column, validator branch, DAL write, constants, both
`.env` files, and the frontend form fields. The column held only `{}` in every
row, which was verified before dropping it.

D3 is therefore satisfied without a flag to get wrong: the only payout data LX
stores is `payoutRef` (**who** to pay) and `payoutTxnRef` (the reference Finance
captures once a claim is actually paid). Neither is a credential. `Student.bank*`
in core remains the single store of account details.

**Open gap:** `Employee` has no bank columns in core. If club heads are
employees, D3 is unresolved for them — core needs a payout record. Flagged, not
worked around.

---

## 4. Uploads — DONE, shim mirrors core byte-for-byte

The module adds **no** S3 client (`@aws-sdk/client-s3` stays core's).

`services/lx/uploadService.js` is a dev shim that reproduces core's
`POST /api/v1/upload/presigned-url` exactly — same request body, same
`{ message, uploadUrl, s3Path, expiresIn }` response, same `s3:<bucket>:<key>`
pointer format. Bytes land in `.uploads/` instead of S3.

The **frontend flow is the real production flow**: presign → PUT with the exact
`Content-Type` → persist the returned `s3Path`.

**Handoff is one constant.** In `src/features/upload/uploadApi.ts`:

```ts
const UPLOAD_BASE = "/lx/upload"; //  →  "/upload"
```

…then delete `routes/lx/uploadRoutes.js`, `controllers/lx/uploadController.js`,
`services/lx/uploadService.js`, and the kit's copy of `uploadApi.ts` (core
already has one at that path).

Only pointers are stored — never a public bucket URL. Read paths resolve them
so core's `s3UrlMiddleware` can sign short-lived GETs in production.

**Untrusted-confirm rule honoured:** every submitted `s3Path` is verified with
`objectExists()` before it is persisted. A forged pointer is rejected 400:

```
Image "s3:lx-dev-bucket:img/never-uploaded.png" was never uploaded —
presign and upload it before submitting
```

### Where uploads are wired

| Feature             | Column                                 | UI                                           |
| ------------------- | -------------------------------------- | -------------------------------------------- |
| Reimbursement bills | `LxReimbursement.bills` (≥1 required)  | list uploader + gallery on the review screen |
| Expense bills       | `LxExpense.bills`                      | list uploader + bills column                 |
| Product mockups     | `LxProduct.images` (≤8, `[0]` = cover) | grid uploader, thumbnail strip, lightbox     |
| Files module        | `LxFile.fileKey`                       | replaced the old `filename`/`path` pair      |

---

## 5. API envelope — DONE

Services return `{ success, message, statusCode, data?, pagination? }`.

Pagination on **every** list endpoint now matches core's `buildPaginationMeta`:

```json
{
    "page": 1,
    "limit": 10,
    "totalCount": 42,
    "totalPages": 5
}
```

Exactly those four keys — nothing more. `totalRecords` (the kit's old key) is
gone from LX code, and `hasNextPage` / `hasPreviousPage` have been **removed**:
clients had begun reading them, which made the kit's response a superset of
core's and guaranteed a break at integration. Both are derivable from `page`
and `totalPages`.

The default page size is core's **10** (the kit used 12, and 24/50/60 in
places), capped at 100.

Verified across all 12 list endpoints.

`Idempotency-Key` is accepted on expense submit and stored as a unique column
on `LxExpense` and `LxReimbursement`; a replay returns the original row with
200 rather than booking the spend twice.

> The scaffold's own `demo` module still emits `totalRecords`. Left untouched —
> it is scaffold-owned code, not ours to change.

---

## 6. Collisions — coexist, D1 still unsigned

| Core product                                                   | LX table                  | Stance                                                                                                                              |
| -------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `Club` / `ClubEvent` / `ClubMember` (`/api/v1/club`, `/clubs`) | `LxClub`, `LxEvent`       | **Coexist** (pack option 2). Different product: budgets, semesters, approval workflow. Routes `/api/v1/lx/club`, Redux key `lxClub` |
| `Building→Floor→Room→RoomBooking` (Book Venue)                 | `LxRoom`, `LxRoomBooking` | Coexist — LX event space, not hostel/classroom stock. LX never writes core `RoomBooking`                                            |
| `Achievement` (profile / OAA)                                  | `LxAchievement`           | Different entity — clan points + campus recognition                                                                                 |

**D1 is a maintainer decision and is not made here.** If you choose _defer_
instead, `LxClub` is dropped and LX rows point at core clubs via
`coreClubId Int?`. To keep that migration cheap, nothing outside the club module
assumes `LxClub` exists — the club id is an opaque string everywhere else.

Reducer keys `clubs` and `roomBooking` are not used; the module registers
`lxClub`, `lxRoom`, …

---

## 7. Open items for maintainers

These need a core-side decision or change. None are worked around silently.

1. **`PERMISSIONS_MODELS` has no `Lx`.** Adding it is a core schema + enum
   change. Until then the kit gates verbs with its own
   `middleware/lxRequirePermission.js` + `helper/lxPermissions.js`. Pick one:
   a single `Lx` model with CRUD, or finer `LxEvent` / `LxRoom` / … models.
   Row-scoping (club head sees only their club) stays in the LX DALs either
   way — middleware cannot filter rows.
2. **No `APPROVE` action exists** in core's `Permission` enum. LX state
   transitions currently map to `UPDATE`. Request a new enum value if you want
   approve gated separately.
3. **`btree_gist` exclusion constraint** on `lx_room_bookings`. The module
   cannot ship raw SQL. Until it exists, overlap prevention is an application
   check inside a Serializable transaction — the SQL is in
   `roomBookingModel.prisma`. **Do not claim database-level prevention until
   this lands.** (Core's own Book Venue has the same gap.)
4. **Partial indexes** `WHERE deleted_at IS NULL`, and a `pg_trgm` GIN index on
   achievement title (Phase 2).
5. **`recharts` is not a `frontend-v2` dependency.** One page uses it:
   `src/app/(erp)/lx/analytics/page.tsx`. Either add the dep or tell us which
   chart library to switch to.
6. **`LxAuditLog` does not exist.** `payouts.md` refers to it for finance
   transitions. Not built — say whether you want it in the module or expect LX
   to write to a core audit table.
7. **Employee payouts** — see §3.

## 8. Things to delete at handoff

| Path                                                                                                                                 | Why                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `middleware/lxActor.js`                                                                                                              | Dev actor shim. Replaced by `authenticate` + a `req.user → req.actor` mapper (the exact production body is in the file header) |
| `routes/lx/userRoutes.js`, `controllers/lx/userController.js`, `services/lx/userService.js`, `dals/lx/userDal.js`                    | Back the dev switcher only                                                                                                     |
| `routes/lx/uploadRoutes.js`, `controllers/lx/uploadController.js`, `services/lx/uploadService.js`                                    | Core owns uploads                                                                                                              |
| `src/components/lx/RoleSwitcher.tsx`                                                                                                 | Explicitly must not ship                                                                                                       |
| `src/hooks/useCan.ts`, `src/lib/permissions.ts`                                                                                      | LX-only UX helpers — use `useAccessControl()` / `ac.can(Model.Lx, Action.UPDATE)` instead                                      |
| `src/features/upload/uploadApi.ts`                                                                                                   | Core already has this file at this path                                                                                        |
| `LxMember.displayName` / `.email` / `.avatar`                                                                                        | Marked `DEV-SHIM ONLY`; core owns all three                                                                                    |
| `prisma.config.ts` line `import 'dotenv/config'`                                                                                     | Core injects the datasource url                                                                                                |
| `.uploads/`                                                                                                                          | Fake bucket                                                                                                                    |
| The `x-lx-actor-ref` header (frontend `src/lib/axios.ts` interceptor, and the entry in `app.js` CORS `Access-Control-Allow-Headers`) | Trusted only because nothing here is authenticated                                                                             |

## 9. Frontend moves at handoff

- `src/features/lx/` → `src/features/erp/lx/`; update `@/features/lx/…` imports.
- Sidebar: register **one** ERP item with children, not 13 top-level links.
  Gate each child with `required: { model: Model.Lx, action: Action.READ }`.
- Routes `/clubs/**` and `/book-venue/**` are occupied by other products; LX
  uses `/lx/**` throughout. `/lx/calendar` is free (`/comming-soon` is the
  unbuilt core calendar).
- Brand tokens already match production (`--primary: #b61d45`). No component
  hardcodes a brand hex — verified.
