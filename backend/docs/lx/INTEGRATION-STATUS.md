# LX integration status

Response to `lx-scaffold-integration.md` and `lx-frontend-scaffold-integration.md`.

Every item is listed with what actually happened. Where something was **not**
done, the reason is stated rather than omitted.

---

## Two items in the review were already fixed

Worth flagging so they are not re-raised:

| Reported                                                     | Reality                                                                                                                        |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| "Actor header disagrees: `x-lx-user-id` vs `x-lx-actor-ref`" | Both sides send and read `x-lx-actor-ref`. Unified before the review.                                                          |
| "Every LX slice reads `pagination.totalRecords`"             | No LX slice does. `totalRecords` survives only in the untouched **demo** scaffold module, which the backend plan itself notes. |

---

## Done — backend

| Item                      | What changed                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Unguarded routes**      | **50 verbs across 18 files had no permission check at all.** All now carry `requirePermission`. Reads take a new baseline `VIEW_LX` that every role holds — it restricts nothing today and exists so the core swap is mechanical (`VIEW_LX` → `checkPermission(ModelName.Lx, READ)`) instead of an audit of twenty route files.                                                                                     |
| **GUEST as a write path** | Worse than reported: all five `/lx/file` verbs and both `/lx/upload` verbs were ungated. Fixed, and one overloaded permission split in two — `UPLOAD_FILE` (publish to the **shared** library: staff and leads) vs `UPLOAD_ATTACHMENT` (bytes behind your **own** submission: everyone). A student must be able to attach a bill to their own claim; they must not be able to write to the shared document library. |
| **Validation location**   | `validators/lx/{e}Schema.js` → `validations/lx/{e}.validation.js`.                                                                                                                                                                                                                                                                                                                                                  |
| **Validation middleware** | `validateBody` / `validateQuery` / `validateParams`, signature identical to core's. 62 schemas wired onto routes; `schema.parse()` removed from all 17 controllers.                                                                                                                                                                                                                                                 |
| **Zod 4**                 | Upgraded. All 29 `errorMap` usages → `message` (valid in both 3 and 4), verified working on 3 first, then on 4.                                                                                                                                                                                                                                                                                                     |
| **Prisma stamping**       | `cuid()` → `gen_random_uuid() @db.Uuid` (17 ids + every referencing column), `updatedAt @default(now()) @updatedAt`, `updatedBy Int?` on 14 models, `deletedAt` added to `LxMember`.                                                                                                                                                                                                                                |
| **Real FKs**              | `LxEvent`→`LxClub`/`LxClan`, `LxExpense`→`LxEvent`, `LxRoomBooking`→`LxEvent`, `LxAchievement`/`LxFile`/`LxProduct`/`LxReimbursement`→`LxClub`/`LxClan`, `LxInitiative`→`LxClan`, `LxMember`→`LxClub`/`LxClan`, with back-relations.                                                                                                                                                                                |
| **Prisma errors leaking** | Adding FKs made `P2003` reachable, and it surfaced as a **500 carrying the raw driver message**, leaking table and constraint names. Mapped centrally: `P2003`→400, `P2002`→409, `P2025`→404, `P2000`→400. A genuine 500 no longer returns the underlying message.                                                                                                                                                  |
| **Layering**              | `identityService` (a service) and `lxActor` (middleware) each held their own Prisma client. Both now go through `dals/lx/memberDal.js`. **No file outside `dals/` imports Prisma.**                                                                                                                                                                                                                                 |
| **Pagination**            | Exactly core's `buildPaginationMeta`: `{ page, limit, totalCount, totalPages }`. `hasNextPage`/`hasPreviousPage` removed — clients had started reading them, making the kit's response a superset of core's. Every list default 12 → **10**, cap 100.                                                                                                                                                               |
| **Bank details**          | `LxReimbursement.bankDetails` and `LX_COLLECT_BANK` deleted outright — column, validator, DAL write, constants, both `.env` files, and the frontend form fields. The dropped column held only `{}` (verified before dropping). `payoutRef` unchanged.                                                                                                                                                               |
| **Postman**               | `postman/collections/lx.postman_collection.json` — 105 requests, 23 folders, **generated from `routes/lx/*.js`** so it cannot drift. Each request records its permission and validator.                                                                                                                                                                                                                             |
| **Prettier**              | `tabWidth: 4`, `format` / `format:check` scripts. Reformat is its own commit so it does not bury the substantive diff.                                                                                                                                                                                                                                                                                              |

## Done — frontend

| Item                     | What changed                                                                                                                                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Slices owning HTTP**   | All 8 (dashboard, budget, feed, calendar, approval, report, access, analytics) split into `types → Api → Thunks → Slice`.                                                                                                                               |
| **Page calling axios**   | The analytics CSV download moved to `reportApi.downloadCsv` + a thunk. Five more components were also reaching for axios (`CreateEventForm`, `BookRoomModal`, `EntityBlog`, clan detail, expenses). **No page or component imports axios for LX data.** |
| **`npm run lint`**       | Was **broken since the Next 16 upgrade** — `next lint` no longer exists, so the script errored on a missing `./lint` directory and nothing had ever been linted. Replaced with `eslint .` on a flat config using `eslint-config-next@16`.               |
| **Bugs lint then found** | Five real ones — see below.                                                                                                                                                                                                                             |
| **Pagination**           | `hasNextPage`/`hasPreviousPage` dropped from 11 type files; every slice default page size → 10.                                                                                                                                                         |
| **recharts**             | Charts extracted to `AnalyticsCharts.tsx` behind `next/dynamic`, out of the main bundle.                                                                                                                                                                |
| **date-fns**             | **Removed** — it was at v4 (v2 is on ^3.6.0) and imported nowhere. An unused dep at the wrong major is pure merge risk.                                                                                                                                 |
| **Debounce + abort**     | Already present on all six search hooks, not just clubs.                                                                                                                                                                                                |

### The five bugs turning lint on surfaced

1. `clubs/[id]` called `useBudgetAwareness` **after an early return**, so hook order changed between the found and not-found renders.
2. `LiveBookingCard` read `Date.now()` **during render** — two renders in one commit could disagree about a booking's phase.
3. `eventApi.getAll` and `achievementApi.getAll` **accepted an `AbortSignal` and never passed it to axios**, so the debounced hooks' `.abort()` did nothing and superseded searches still raced.
4. The mobile drawer closed via a route-change effect duplicating the `onNavigate` already on every link.
5. `BookingDialog` stored "no results" instead of deriving it.

---

## Not done — and why

These are **integration-time restamps**. Doing them in the kit stops it running,
which would leave nothing reviewable. The copy map in the plan treats them the
same way ("copy, then restamp").

| Item                                                       | Why not here                                                                       | Cost at integration                                                                                                            |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Delete `lxActor.js`, map `req.user` → `req.actor`          | The kit has no `authenticate` and no JWT issuer.                                   | **One file.** `resolveActor` already calls `findMemberByReferenceIdDal(ref)`; swap the header read for `req.user.referenceId`. |
| `checkPermission(ModelName.Lx, …)`                         | `ModelName` has no `Lx` — a **core schema + enum change**, listed as an open item. | Mechanical. Every route already carries `requirePermission(PERMISSIONS.X)` in the same position; `VIEW_LX` maps to `READ`.     |
| `PrismaPg` + `pg.Pool` + Prisma 7.9                        | Needs core's pool and SSL config.                                                  | Never copy `services/prismaClient.js` or `prisma.config.ts`.                                                                   |
| `features/lx/` → `features/erp/lx/`                        | The kit has no `features/erp/`.                                                    | Directory move + import rewrite.                                                                                               |
| Delete `RoleSwitcher`, kit axios, `/lx/user`, `/lx/upload` | They are the only way to exercise RBAC and uploads without core.                   | Delete; identity comes from `state.auth`, uploads from core presign.                                                           |
| `useCan()` → `useAccessControl()`                          | `Model`/`Action` enums do not exist here.                                          | `useCan` is already the single gate — one hook to swap.                                                                        |
| `react-hook-form` + shared molecules                       | v2's `shared/` component library is not in this repo.                              | Per-form work; schemas are already colocated and reusable.                                                                     |

## Deliberate conflict with the kit's own rulebook — needs a ruling

The backend plan told us to move validation to `validations/` and to
`validateBody` / `validateQuery` / `validateParams` middleware, dropping
`schema.parse()` from controllers. That was done. It puts the LX module in
**direct conflict with this kit's `RULES.md`**, which opens with "Breaking them
blocks handoff":

| Kit rule                              | What it says                                                                   | What LX now does                                         |
| ------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `RULES.md` #9                         | "Validators are Zod schemas — **not** Express middleware."                     | Validation _is_ Express middleware.                      |
| `RULES.md` #10                        | "Call `schema.parse(...)` **inside** the controller."                          | No controller calls `parse()`.                           |
| `RULES.md` #11                        | "Validators → `validators/{module}/{entity}Schema.js`"                         | Schemas live in `validations/lx/{entity}.validation.js`. |
| `ACCEPTANCE_CHECKLIST.md`             | Checklist items require `validators/{module}/` and a `schema.parse` controller | LX fails both **by design**.                             |
| `CONTRIBUTING.md` / `docs/HANDOFF.md` | Layer flow and copy paths both name `validators/`                              | LX ships `validations/`.                                 |

We did **not** edit those files. They are kit-owned and shared across every
outsourcing team — silently rewriting the shared rulebook to make our module
pass its own review would be the wrong call, and would change the rules for
vendors who never saw the LX plan.

**The ruling we need:** either the kit docs get updated centrally to the core
convention (in which case LX is already correct and every other vendor module
needs the same migration), or LX is granted a documented exception. Right now a
reviewer running `ACCEPTANCE_CHECKLIST.md` against LX will fail it on items that
the integration plan explicitly required.

The `demo` module still follows the old kit pattern (`validators/demo/`,
`schema.parse` in the controller) and was left untouched, so the kit's own
sample still matches its own rules.

---

## Maintainer decisions — SETTLED

Confirmed by Sarthak Joshi on 23 Sep 2026. Recorded here so the assumptions
below are no longer assumptions:

| Decision         | Ruling                                                                                                                                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D1 — clubs**   | **Coexist.** Keep `LxClub`; not core `/clubs`.                                                                                                                                                                                                                      |
| Rooms            | Stay separate from Book Venue. Keep `LxRoom` / `LxRoomBooking`.                                                                                                                                                                                                     |
| Achievements     | `LxAchievement` is not OAA `Achievement`. Routes stay under `/lx`.                                                                                                                                                                                                  |
| Permission grain | One `Model.Lx` with CRUD. Core adds `ModelName.Lx`; `VIEW_LX` maps to `READ` at copy time. Row-scope stays in these DALs.                                                                                                                                           |
| `APPROVE`        | **Not** being added. Approve/reject maps to `UPDATE`.                                                                                                                                                                                                               |
| Audit log        | An `LxAuditLog` will be added **in this module** during integration, for finance and approval transitions. No shared core table.                                                                                                                                    |
| Employee payouts | Stay blocked until core has a payout record. Student `payoutRef` unchanged.                                                                                                                                                                                         |
| `btree_gist`     | Application-level overlap check accepted for v1. Maintainers add the constraint in their migration.                                                                                                                                                                 |
| Kit rules        | `validations/` + middleware is correct and stays. Maintainers are updating the shared `RULES.md` / checklist so other vendors follow it. `demo/` stays on the old layout until that lands.                                                                          |
| Brand / UI       | Kit demo stays aligned with the live app (crimson `#b61d45` titles and primary buttons, orange sidebar active). Kit `globals.css`, header and rail are **not** copied — v2 has `ERPLayout`. Colour Guide vs live app is a Design/v2 decision, outside this handoff. |

---

## Carry these into v1 when copying

Flagged at the maintainers' request — these are part of v1 and easy to miss
because they arrived after the original plan was written:

| Surface                   | What to copy                                                                                                                                                                                                                                                                                       |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lost & Found**          | `LxLostFoundItem`; `routes/lx/lostFoundRoutes.js` + its controller / service / DAL. Posts are approval-gated, so they ride on the same approvals surface.                                                                                                                                          |
| **Library cabin booking** | `LxCabin`, `LxCabinBooking`, `LxCabinBlock`; `routes/lx/cabinRoutes.js` and the cabin admin/booking services. Note `LxCabinBooking.slotKey` is a nullable unique — claiming a slot IS the unique insert, so this one already has database-level double-booking prevention, unlike `LxRoomBooking`. |
| **`LIBRARIAN` role**      | In the `LxMemberRole` enum and in `helper/lxPermissions.js`. It is a seventh role alongside ADMIN / LX_TEAM / CLUB_HEAD / CLAN_HEAD / FINANCE / GUEST, and the cabin desk screens depend on it.                                                                                                    |

---

## Decisions as they stood before the ruling above (kept for context)

| Decision                           | Current assumption                                                                                                                                                                                                                                                                                                                                                                                                | If it flips                                                                                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D1 — clubs**                     | **Coexist.** FKs point at `LxClub`.                                                                                                                                                                                                                                                                                                                                                                               | `LxClub` is deleted and references become `coreClubId Int?`. Every LX surface reading a club changes anyway, so the FK is not the expensive part. |
| Rooms                              | LX event space stays separate from Book Venue.                                                                                                                                                                                                                                                                                                                                                                    | Drop `LxRoom`, FK to core `Room.id`.                                                                                                              |
| Achievements                       | `LxAchievement` (clan points + feed) ≠ OAA `Achievement`.                                                                                                                                                                                                                                                                                                                                                         | Routes stay `/lx/achievement` either way.                                                                                                         |
| Permission grain                   | One `Model.Lx` with CRUD.                                                                                                                                                                                                                                                                                                                                                                                         | Finer models = more enum values; row scope stays in the DALs regardless.                                                                          |
| `APPROVE` action                   | Approve routes use their own LX verbs.                                                                                                                                                                                                                                                                                                                                                                            | Map to `UPDATE`, or add `APPROVE` to core's `Permission` enum.                                                                                    |
| Audit log                          | No `LxAuditLog`. Finance transitions are **not** audited.                                                                                                                                                                                                                                                                                                                                                         | Needs either an LX table or a shared core one.                                                                                                    |
| Employee payouts                   | `payoutRef = "student-bank:<enrollmentNo>"`.                                                                                                                                                                                                                                                                                                                                                                      | `Employee` has **no** bank columns, so employee reimbursements are blocked until core adds a payout record.                                       |
| `btree_gist` on `lx_room_bookings` | Overlap is now re-checked and inserted inside ONE Serializable transaction, retried on 40001/P2034. Verified against the dev database: 5 simultaneous bookings for the same slot give 1 booking and 4 clean 409s. **An earlier version of this document claimed that was already the case. It was not** — the check and the insert were separate queries with no transaction between them, so both could succeed. | Still application-level. The `btree_gist` exclusion constraint is the database-level guarantee and remains a maintainer migration.                |

Note: `LxCabinBooking` **does** have database-level prevention — `slotKey` is
unique and nullable, so claiming a slot is the unique insert. `LxRoomBooking`
does not.

---

## Documentation corrected to match the code

Three of our own docs still described the module as it was **before** these
fixes. A reviewer reading them would have re-raised items that are already done:

| File                                           | Was                                                                                                                                 | Now                                                                                                               |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `docs/LX_CORE_PACK_CONFORMANCE.md` §5          | Showed `hasNextPage` / `hasPreviousPage` in the shipped pagination envelope and called them "additive extras [that] can be dropped" | Shows core's four keys exactly; records that both were removed, and the default page size of 10                   |
| `docs/LX_CORE_PACK_CONFORMANCE.md`             | "The `bankDetails` column — read this … still exists and is a known D3 violation … gated behind `LX_COLLECT_BANK`"                  | "removed" — column, flag, validator, DAL write, constants, `.env`, and form fields all deleted                    |
| `docs/lx/ARCHITECTURE.md` §8.2 (frontend repo) | Proposed keyset envelope using `hasNextPage`, readable as shipped behaviour                                                         | Same proposal, with a status note that it is unapproved and that the shipped offset envelope has no `hasNextPage` |

Sarthak's two review documents committed in these repos are inputs and were
left exactly as received.

---

## Verification

Backend: 21 endpoints serve 200; 50 guarded verbs checked across six roles;
FK integrity enforced (a bad id returns 400, not a 500); pagination shape and
default page size confirmed on 12 lists.

Frontend: type-check clean, **0 lint errors and 0 warnings**, production build
compiles, all 20 screens serve 200.
