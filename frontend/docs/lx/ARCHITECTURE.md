# LXOS — Learner Experience OS

## Architecture & Scale Design

**Status:** Draft for maintainer review
**Module slug:** `lx` (⚠️ **not yet reserved** with RishiVerse maintainers — see §12.1)
**Target repos:** `rishiverse-backend-module-scaffold` → `RishiVerse-Backend`, `rishiverse-frontend-module-scaffold` → `rishiverse-frontend-v2`
**Date:** 10 August 2026

---

## Table of contents

1. [Purpose and scope](#1-purpose-and-scope)
2. [Context: how LXOS enters RishiVerse](#2-context-how-lxos-enters-rishiverse)
3. [Mergeability contract](#3-mergeability-contract)
4. [Domain model](#4-domain-model)
5. [Backend architecture](#5-backend-architecture)
6. [Identity, RBAC, and data scoping](#6-identity-rbac-and-data-scoping)
7. [Data architecture](#7-data-architecture)
8. [Scale architecture](#8-scale-architecture)
9. [Frontend architecture](#9-frontend-architecture)
10. [Cross-cutting concerns](#10-cross-cutting-concerns)
11. [Security and privacy](#11-security-and-privacy)
12. [Delivery plan and open decisions](#12-delivery-plan-and-open-decisions)

---

## 1. Purpose and scope

LXOS replaces the existing Learner Experience workflow stack — Excel trackers, WhatsApp coordination, email approval chains — with one role-based platform covering events, rooms, clubs, clans, achievements, reimbursements, budgets, approvals, a campus activity feed, analytics, and a document repository.

### 1.1 This is a re-platform, not a migration

A working LXOS already exists at `learnerexperienceos.vercel.app`, built on **Next.js 14 + MongoDB + NextAuth**. The RishiVerse target stack is **Express + Prisma + PostgreSQL** on the backend and **Next.js 16 + Redux Toolkit** on the frontend.

Nothing carries over except domain logic and UI design. Document collections become relational tables with enforced foreign keys; NextAuth sessions are replaced by RishiVerse's JWT. **Treat the Vercel app as the specification, not as a codebase to port.** Where this document and the live app disagree, this document is the intent — but the live app should be checked for behaviour the 35-page product manual left implicit.

### 1.2 Scope boundary

The product manual documents 13 sections. The platform overview page additionally lists **Partners & Collaborations** and **Fest Management** as first-class modules, which the manual never covers. This document models all of them, but Partners/Fest are **Phase 4 and unconfirmed** — see §12.2.

---

## 2. Context: how LXOS enters RishiVerse

```text
┌────────────────────────────────────┐   ┌────────────────────────────────────┐
│ rishiverse-backend-module-scaffold │   │ rishiverse-frontend-module-scaffold│
│   demo/  +  lx/   ← we build here  │   │   demo/  +  lx/   ← we build here  │
└──────────────────┬─────────────────┘   └──────────────────┬─────────────────┘
                   │ tagged release: lx-vX.Y.Z              │ lx-ui-vX.Y.Z
                   ▼                                        ▼
┌────────────────────────────────────┐   ┌────────────────────────────────────┐
│         RishiVerse-Backend         │   │       rishiverse-frontend-v2       │
│  auth router + checkPermission     │   │  (auth) (erp) (lms) + features     │
│  + all other domains               │   │  + sidebar + useAccessControl      │
└────────────────────────────────────┘   └────────────────────────────────────┘
```

Maintainers **hand-copy folders**. Merging inside a kit installs nothing. Consequences that shape every decision below:

- We own exactly one module slug. Everything namespaces under it.
- We never edit `demo/`, root kit docs, `.cursor/rules`, or other vendors' folders.
- We propose Prisma models. **Core owns migrations.** Anything requiring raw SQL is a _request_, not something we can ship.
- Auth is wrapped around us later. We build for it without building it.

### 2.1 Single-module decision

LXOS maps to **one `lx` module**, not one module per domain.

The deciding factor is that Approvals, Activity Feed, Analytics, and Budget are each read-side aggregations spanning four or more domains. As separate modules, every one of those becomes a cross-module service call, which `DESIGN.md` places under maintainer review. As one module they are ordinary internal calls.

Cost accepted: a single large module folder and a single release tag, so domains cannot be versioned or handed off independently.

---

## 3. Mergeability contract

This section is the checklist a RishiVerse maintainer should be able to run against our PR.

### 3.1 Namespacing — the collision surface

Our Prisma models land in RishiVerse's **shared schema namespace**. Prisma model names and enum names are global; a collision breaks the entire schema for everyone. Therefore:

| Artifact        | Rule                     | Example                         |
| --------------- | ------------------------ | ------------------------------- |
| Prisma models   | `Lx` prefix, always      | `LxEvent`, `LxRoomBooking`      |
| Prisma enums    | `Lx` prefix, always      | `LxEventStatus`, `LxMemberRole` |
| Postgres tables | `lx_` prefix via `@@map` | `@@map("lx_events")`            |
| Postgres enums  | `lx_` prefix via `@@map` | `@@map("lx_event_status")`      |
| API namespace   | one segment              | `/api/v1/lx/...`                |
| Env vars        | `LX_` prefix             | `LX_S3_BUCKET`                  |
| Redis keys      | `lx:` prefix             | `lx:analytics:summary`          |

Generic names — `Event`, `Room`, `Booking`, `Status`, `Role`, `File` — are all plausibly already taken or will be. There are no exceptions to the prefix rule.

### 3.2 Layer compliance

Non-negotiable, from `RULES.md` §12:

```text
routes/lxRoutes.js → routes/lx/{entity}Routes.js → controller
  → Zod schema.parse() → service → DAL → Prisma
```

- Controllers never import Prisma. Services never touch `req`/`res`. DALs never do HTTP.
- Validators are Zod schemas, not middleware; `.parse()` is called inside the controller.
- Every controller `catch` calls `handleControllerErrorResponse(...)`.
- Services return `{ success, message, statusCode, data?, pagination? }`.

### 3.3 What must be stripped or replaced at handoff

Named explicitly so nothing kit-only leaks into production:

| Artifact                                        | Fate                                               |
| ----------------------------------------------- | -------------------------------------------------- |
| `utils/actorUtils.js` (header-based actor stub) | **Replaced** by JWT-derived actor                  |
| Frontend `src/app/api/v1/lx/**` mock handlers   | **Deleted** — never copied                         |
| `prisma/seed.js`                                | Reference data only; core decides seeding strategy |
| Kit `server.js`, open routes                    | Not copied; core mounts under `authRouter`         |
| Local `.env`                                    | Never committed, never copied                      |

### 3.4 Dependencies beyond Express/Prisma/Zod

`RULES.md` §24 requires justification for each. The full list we intend to request:

| Package                                       | Where    | Justification                                                                                        | Alternative if refused                                      |
| --------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `cors`                                        | backend  | Kit backend sends no CORS headers (verified). Required for any browser client on a different origin. | Core may already handle CORS at the gateway — then drop it  |
| `@aws-sdk/client-s3` + `s3-request-presigner` | backend  | Presigned direct-to-S3 uploads for bill images and achievement photos (§8.7)                         | Whatever object storage core already uses                   |
| `ioredis`                                     | backend  | Analytics rollup + feed page-1 cache (§8.5)                                                          | Degrade to in-Postgres rollup tables; slower but functional |
| `recharts`                                    | frontend | Analytics charts — bar, donut, grouped bar                                                           | Whatever charting library frontend-v2 already ships         |
| `date-fns`                                    | frontend | Calendar month/week/day arithmetic                                                                   | Any existing date utility in frontend-v2                    |

**Before adding any of these, check what `RishiVerse-Backend` and `rishiverse-frontend-v2` already depend on and prefer that.** Every row above should be re-validated against the real monorepos at integration time, not decided unilaterally in the kit.

### 3.5 Copy manifest

```text
# Backend → RishiVerse-Backend
routes/lx/                       routes/lxRoutes.js
controllers/lx/                  services/lx/
dals/lx/                         validators/lx/
constants/lxConstant.js          helper/lxHelper.js
prisma/models/lx/                docs/lx.md
# + one line in app.js:  authRouter.use('/lx', lxRoutes)

# Frontend → rishiverse-frontend-v2
src/app/(erp)/lx/                src/features/lx/
src/constants/endpoints.ts       # only LX keys — merge carefully
src/store/rootReducer.ts         # only LX reducer lines — merge carefully
# NOT copied: src/app/api/v1/lx/**, kit (erp) stub layout
```

The frontend handoff skill additionally requires us to supply, per its summary template: the **suggested sidebar menu label and href** for `src/config/sidebar/menu.ts`, the expected **models/actions** for `useAccessControl`, the **backend contract table**, and env var names only. LXOS supplies one top-level sidebar entry with the §9.2 routes nested beneath it; the permission matrix in §6.2 is the `useAccessControl` input.

---

## 4. Domain model

### 4.1 Entities by phase

| Phase                   | Entities                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| **1 — Core slice**      | `LxMember`, `LxRoom`, `LxEvent`, `LxRoomBooking` (+ approvals as a read view)                            |
| **2 — Community**       | `LxClub`, `LxClubUpdate`, `LxClan`, `LxClanPointTxn`, `LxClanInitiative`, `LxAchievement`, `LxFeedEntry` |
| **3 — Money & insight** | `LxExpense`, `LxBudgetAllocation`, `LxFile`, `LxAuditLog`, `LxAnalyticsDaily`                            |
| **4 — Unconfirmed**     | `LxPartner`, `LxCollaboration`, `LxFest`, `LxVendor`                                                     |

### 4.2 Identity: why there is no LXOS `User` table

`RULES.md` §23 and `docs/CONTRACTS.md` forbid redefining core `Student`/`User`. RishiVerse already owns identity (`User.userId` Int PK, `User.referenceId`, `Student.enrollmentNo`).

LXOS therefore stores only its **own** concern — role assignment and org membership:

```prisma
model LxMember {
  id          String       @id @default(cuid())
  referenceId String       @unique          // FK-by-convention to core User.referenceId
  role        LxMemberRole @default(GENERAL)
  clubId      String?
  clanId      String?
  isActive    Boolean      @default(true)
  deletedAt   DateTime?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([role])
  @@index([clubId])
  @@index([clanId])
  @@map("lx_members")
}

enum LxMemberRole {
  ADMIN
  LX_TEAM
  CLUB_HEAD
  CLAN_HEAD
  FINANCE
  GENERAL

  @@map("lx_member_role")
}
```

`referenceId` is a **soft reference**. We do not declare a Prisma relation to core `User` from the kit, because the kit does not contain that model. At integration, maintainers may promote it to a real foreign key — this is an explicit request in §12.3. Display names, emails, and enrollment numbers are **never duplicated** into LXOS tables; they are resolved from core at read time.

### 4.3 Core entities (Phase 1)

```prisma
model LxRoom {
  id         String   @id @default(cuid())
  code       String   @unique              // "AB-201"
  name       String
  building   String?
  capacity   Int
  roomType   LxRoomType @default(CLASSROOM)
  amenities  String[]                      // PROJECTOR | WHITEBOARD | AC | MIC
  isBookable Boolean  @default(true)
  deletedAt  DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  bookings   LxRoomBooking[]

  @@index([isBookable, capacity])
  @@map("lx_rooms")
}

model LxEvent {
  id               String        @id @default(cuid())
  title            String
  description      String?
  eventType        LxEventType
  status           LxEventStatus @default(PENDING)
  startsAt         DateTime
  endsAt           DateTime
  budgetAllocated  Decimal       @default(0) @db.Decimal(12, 2)
  organiserRef     String                     // core User.referenceId
  clubId           String?
  clanId           String?
  reviewedByRef    String?
  reviewedAt       DateTime?
  reviewNote       String?
  deletedAt        DateTime?
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  bookings         LxRoomBooking[]

  @@index([status, startsAt])
  @@index([clubId, startsAt])
  @@index([clanId, startsAt])
  @@index([organiserRef])
  @@map("lx_events")
}

model LxRoomBooking {
  id        String   @id @default(cuid())
  eventId   String
  roomId    String
  startsAt  DateTime
  endsAt    DateTime
  deletedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  event     LxEvent  @relation(fields: [eventId], references: [id])
  room      LxRoom   @relation(fields: [roomId], references: [id])

  @@index([roomId, startsAt, endsAt])   // drives the conflict check
  @@index([eventId])
  @@map("lx_room_bookings")
}
```

Enums: `LxEventType { CLUB CLAN LX FEST }`, `LxEventStatus { PENDING APPROVED REJECTED COMPLETED CANCELLED }`, `LxRoomType { CLASSROOM SEMINAR AUDITORIUM LAB OUTDOOR }`.

### 4.4 Two ledger invariants

Both clan points and budget spend are **derived quantities**. Storing them as freely mutable columns guarantees drift — the exact Excel failure LXOS exists to fix. The rule for both:

> The ledger table is the source of truth. Any total stored on the parent row is a **cache**, written in the same transaction as the ledger row, and reconcilable by replaying the ledger.

**Clan points.** `LxClanPointTxn` is append-only (`delta`, `reason`, `actorRef`, `sourceType`, `sourceId`, `createdAt`). `LxClan.points` is the cache. This directly delivers the product manual's promise of a full, dispute-proof audit trail.

**Budget.** `LxBudgetAllocation` holds deliberate allocations per club/clan per cycle. Spend is **computed** from approved `LxExpense` rows plus approved `LxEvent.budgetAllocated` — never stored as a mutable `spent` column. The dashboard reads a cached rollup (§8.5), not a live cross-table aggregate.

### 4.5 Approvals: a view, not a table

There is no polymorphic `LxApproval` table. Each approvable entity carries its own `status`, `reviewedByRef`, `reviewedAt`, `reviewNote`. The Approvals queue is a **read-side aggregator service** that unions pending rows across events, room bookings, achievements, and expenses, filtered by what the actor may approve.

Rationale: a generic approvals table would need untyped `entityType`/`entityId` columns with no referential integrity, and every consumer would join back out to the real row anyway. Per-entity status keeps foreign keys real and matches the kit's soft-delete/status conventions.

Cost: the aggregator does N queries for N approvable types. At our data volumes each is an indexed lookup on `(status, createdAt)` returning a bounded page — see §8.4 for the query budget.

**Reimbursements are the exception in shape only:** they carry a three-stage workflow (`RAISED → LX_APPROVED → FINANCE_PROCESSED`, plus `REJECTED`) rather than a single approve/reject. Same pattern, longer enum.

---

## 5. Backend architecture

### 5.1 Request flow

```text
client
 → app.js  →  /api/v1  →  authRouter (production only)
 → routes/lxRoutes.js                     aggregator
 → routes/lx/{entity}Routes.js            verbs + route logging
 → controllers/lx/{entity}Controller.js   parse actor, schema.parse(), permission gate
 → services/lx/{entity}Service.js         orchestration, result objects
 → dals/lx/{entity}Dal.js                 Prisma, scoping, soft-delete
 → PostgreSQL
```

### 5.2 Layer responsibilities as specialised for LXOS

| Layer      | LXOS-specific duty                                                                |
| ---------- | --------------------------------------------------------------------------------- |
| Controller | Resolve `actor`; `can(actor, ACTION)` gate; `schema.parse`; map result → envelope |
| Validator  | Shape only. Never role logic, never DB lookups                                    |
| Service    | Domain decisions, transactions, cross-entity orchestration, cache invalidation    |
| DAL        | Prisma only. **Applies actor scoping to the `where` clause**                      |
| Helper     | Pure functions: `can()`, scope predicates, date-range math                        |
| Constants  | Role list, permission matrix, status enums, sort allow-lists                      |

### 5.3 File layout

```text
constants/lxConstant.js
helper/lxHelper.js
utils/actorUtils.js                        # kit-only, stripped at handoff
validators/lx/{member,room,event,roomBooking,approval,...}Schema.js
dals/lx/{...}Dal.js
services/lx/{...}Service.js
controllers/lx/{...}Controller.js
routes/lx/{...}Routes.js
routes/lxRoutes.js
prisma/models/lx/{...}Model.prisma
docs/lx.md
```

### 5.4 URL surface (Phase 1)

Following the kit's mandated `/new`, `/all`, `/:id` shape:

| Method           | Path                                 | Notes                                                           |
| ---------------- | ------------------------------------ | --------------------------------------------------------------- |
| POST             | `/api/v1/lx/room/new`                | ADMIN only                                                      |
| GET              | `/api/v1/lx/room/all`                | `?search&type&minCapacity&availableFrom&availableTo&page&limit` |
| GET/PATCH/DELETE | `/api/v1/lx/room/:roomId`            | DELETE is soft                                                  |
| POST             | `/api/v1/lx/event/new`               | body includes `roomIds[]`; booking created transactionally      |
| GET              | `/api/v1/lx/event/all`               | `?search&status&type&clubId&clanId&from&to&cursor&limit`        |
| GET/PATCH/DELETE | `/api/v1/lx/event/:eventId`          |                                                                 |
| PATCH            | `/api/v1/lx/event/:eventId/decision` | approve/reject; optimistic guard (§10.2)                        |
| GET              | `/api/v1/lx/room-booking/all`        | calendar feed, bounded window                                   |
| GET              | `/api/v1/lx/approval/all`            | aggregated queue                                                |

`/decision` is a deliberate departure from bare CRUD: approval is a state transition with its own permission, its own audit row, and its own concurrency guard. Modelling it as a generic `PATCH` on `status` would make all three implicit. This needs maintainer sign-off as a pattern (§12.3).

---

## 6. Identity, RBAC, and data scoping

### 6.1 The actor

Every service takes an explicit actor:

```js
{
    (referenceId, role, clubId, clanId);
}
```

**In the kit** it comes from request headers via `utils/actorUtils.js`, defaulting to a dev ADMIN. **In production** maintainers populate it from the JWT. The service and DAL layers never learn which. That is the whole point: all authorization logic below the controller is already written and tested when auth arrives.

### 6.2 Two separate concerns

These are routinely conflated and must not be:

**Verb gating** — _may this actor perform this action at all?_ Declarative, in `constants/lxConstant.js`:

```js
export const LX_PERMISSIONS = {
    EVENT_CREATE: ["ADMIN", "LX_TEAM", "CLUB_HEAD", "CLAN_HEAD"],
    EVENT_APPROVE: ["ADMIN", "LX_TEAM"],
    CLAN_POINTS_MANAGE: ["ADMIN"],
    EXPENSE_APPROVE: ["ADMIN", "FINANCE"],
    BUDGET_VIEW: ["ADMIN", "LX_TEAM", "FINANCE"],
    USER_MANAGE: ["ADMIN"],
    // … full 6 × 14 matrix from the product manual
};
```

Checked in the controller via a pure `can(actor, action)`. At handoff this maps cleanly onto core's `checkPermission` — we hand over the matrix and core wires it.

**Data scoping** — _which rows may this actor see?_ This is a `where`-clause concern and lives in the DAL:

```js
const scopeEventWhere = (where, actor) => {
    switch (actor.role) {
        case "ADMIN":
        case "LX_TEAM":
        case "FINANCE":
            return where; // full visibility
        case "CLUB_HEAD":
            return { ...where, OR: [{ clubId: actor.clubId }, { status: "APPROVED" }] };
        case "CLAN_HEAD":
            return { ...where, OR: [{ clanId: actor.clanId }, { status: "APPROVED" }] };
        default:
            return { ...where, status: "APPROVED" }; // GENERAL sees approved only
    }
};
```

**Why this cannot be deferred to maintainers.** Route middleware can reject a request; it cannot change which rows a query returns. "Club heads cannot see the budget of other clubs" is a query-shaping rule. If we shipped unscoped DALs, maintainers would have to rewrite our persistence layer to add auth — which is exactly the integration friction the kit exists to prevent. Scoping is ours; enforcement of the verb is theirs.

### 6.3 Scoping is also a performance feature

A scoped `where` is a _more selective_ query. `CLUB_HEAD` reads hit `(clubId, startsAt)`; `GENERAL` reads hit `(status, startsAt)` where `status = 'APPROVED'`. Since GENERAL is the overwhelming majority of traffic, the highest-volume query is also the most selective one. Index design in §7.3 follows directly from the scoping rules.

---

## 7. Data architecture

### 7.1 Conventions

Every domain table carries `id` (cuid), `createdAt`, `updatedAt`, `deletedAt`. Reads filter `deletedAt: null`; deletes set it. Money is `Decimal @db.Decimal(12, 2)` — **never** `Float`. All timestamps are `DateTime` stored UTC; the frontend renders in IST.

### 7.2 Room booking conflicts — the honest position

The product manual states double-booking is "enforced at the database level". Today it cannot be, and this document will not claim otherwise until it is.

**What we ship now.** Overlap is checked and the booking written inside a single `Serializable` transaction, with bounded retry on serialization failure:

```js
await prisma.$transaction(
    async (tx) => {
        const clash = await tx.lxRoomBooking.findFirst({
            where: {
                roomId,
                deletedAt: null,
                startsAt: { lt: endsAt },
                endsAt: { gt: startsAt },
            },
            select: { id: true },
        });
        if (clash) return { conflict: true };
        return tx.lxRoomBooking.create({ data: { eventId, roomId, startsAt, endsAt } });
    },
    { isolationLevel: "Serializable" },
);
```

Under `Serializable`, two concurrent non-overlapping-read transactions that would both insert a clashing row cause one to abort with `40001`, which we retry once and then surface as a clean 409. This is correct, but it is _application_-enforced and relies on nobody writing to the table outside this path.

**What we request from core.** A true constraint, which requires raw SQL that only maintainers may run:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE lx_room_bookings
  ADD CONSTRAINT lx_room_bookings_no_overlap
  EXCLUDE USING gist (
    room_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (deleted_at IS NULL);
```

Once this exists, overlap is impossible regardless of code path, the constraint's GiST index also serves availability queries, and the application check becomes a fast-path courtesy that produces a friendly error instead of a raw constraint violation. Prisma cannot express this, so it is filed as a migration request (§12.3).

### 7.3 Index plan

Indexes are derived from the actual `(where, orderBy)` pairs the scoping rules produce — not added speculatively.

| Table                | Index                           | Serves                                                |
| -------------------- | ------------------------------- | ----------------------------------------------------- |
| `lx_events`          | `(status, starts_at)`           | GENERAL feed, calendar, approvals queue               |
| `lx_events`          | `(club_id, starts_at)`          | CLUB_HEAD scoped list, club detail                    |
| `lx_events`          | `(clan_id, starts_at)`          | CLAN_HEAD scoped list                                 |
| `lx_room_bookings`   | `(room_id, starts_at, ends_at)` | Conflict check, availability                          |
| `lx_achievements`    | `(status, created_at)`          | Approvals, feed source                                |
| `lx_expenses`        | `(status, created_at)`          | Finance queue                                         |
| `lx_expenses`        | `(event_id)`                    | "sorted by event" — the manual's headline requirement |
| `lx_feed_entries`    | `(published_at DESC, id DESC)`  | Keyset feed pagination                                |
| `lx_clan_point_txns` | `(clan_id, created_at DESC)`    | Point history                                         |
| `lx_members`         | `(reference_id)` unique         | Actor resolution on every request                     |

**Partial indexes.** Every read filters `deleted_at IS NULL`, so the hot indexes should be partial:

```sql
CREATE INDEX CONCURRENTLY lx_events_status_starts_live
  ON lx_events (status, starts_at) WHERE deleted_at IS NULL;
```

Prisma cannot express partial indexes either. They go in the same migration request. Until then the plain composite indexes above are correct, just larger.

### 7.4 Full-text search

Achievement search by student name is a headline feature ("pull a student's full record in seconds"). `contains` with `mode: 'insensitive'` — what the kit's demo uses — compiles to `ILIKE '%term%'`, which **cannot use a B-tree index** and degrades linearly.

For Phase 2, request a GIN trigram index and switch to it:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX CONCURRENTLY lx_achievements_title_trgm
  ON lx_achievements USING gin (title gin_trgm_ops);
```

Acceptable to ship `ILIKE` in Phase 1 (rooms and events are small tables). It is **not** acceptable for achievements once the record spans multiple graduating batches.

---

## 8. Scale architecture

### 8.1 Sizing the actual problem

Being concrete matters more than being impressive. Rishihood is on the order of **5,000–8,000 users**. Traffic is not high in a sustained sense — it is **low-baseline and violently spiky**:

| Scenario                        | Shape                                        |
| ------------------------------- | -------------------------------------------- |
| Ordinary weekday                | Tens of req/s. Trivial.                      |
| Fest day / results announcement | Most of campus opens the feed within minutes |
| Monday 9am                      | Login and dashboard stampede                 |
| Reimbursement deadline          | Write burst with file uploads                |

A defensible peak planning figure: **~2,000 concurrent users, ~250–400 req/s, for minutes at a time.** A single well-tuned Node instance against one Postgres handles that comfortably — _if_ the queries are right.

**So the risk is not throughput. It is a handful of specific query patterns that are fine at 50 rows and fatal at 50,000.** The rest of this section addresses those, in descending order of danger. Anything resembling microservices, queues-as-architecture, or sharding would be unjustified for this load and is deliberately excluded.

### 8.2 Danger 1 — `COUNT(*)` on every list request

The kit's demo DAL runs `Promise.all([findMany, count])` on every list call. The `count` re-scans every matching row with no `LIMIT`. Copied verbatim into the feed and the events list, this becomes the single most expensive query in the platform.

**Rule:** offset pagination with exact totals is allowed **only** for bounded admin tables (rooms, clubs, clans — tens to low hundreds of rows, where an exact count is cheap and genuinely useful in the UI).

For the feed, events list, achievements, and expenses, use **keyset (cursor) pagination** and derive `hasNextPage` by fetching `limit + 1`:

```js
const rows = await prisma.lxFeedEntry.findMany({
  where,
  orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
  take: limit + 1,
  ...(cursor && { cursor: { id: cursor }, skip: 1 }),
});
const hasNextPage = rows.length > limit;
return { data: rows.slice(0, limit), hasNextPage, nextCursor: /* last id */ };
```

This is O(limit) at any depth, whereas `skip: 50000` makes Postgres walk and discard 50,000 rows.

**Envelope compatibility.** `DESIGN.md` specifies `pagination: { page, limit, totalRecords }`. Cursor endpoints cannot honestly supply `page`/`totalRecords`. Proposed shape, pending maintainer approval (§12.3):

```json
{ "pagination": { "limit": 20, "cursor": "…", "nextCursor": "…", "hasNextPage": true } }
```

Offset endpoints keep the existing shape unchanged. Clients distinguish by presence of `cursor`.

> **Status note (post-review).** The `hasNextPage` above belongs to this
> _proposed cursor_ envelope only. The **offset** envelope that LX actually
> ships has since been aligned to core's `buildPaginationMeta` exactly —
> `{ page, limit, totalCount, totalPages }`, nothing more. `hasNextPage` /
> `hasPreviousPage` were removed from shipped LX code. This section remains a
> proposal pending §12.3 approval and describes no current behaviour.

### 8.3 Danger 2 — analytics computed per request

The Analytics page and the dashboard stat cards aggregate across events, clubs, clans, achievements, and expenses. Computed live on every dashboard load — by every user, at 9am — that is five-plus full aggregate scans per page view.

**Never aggregate on the request path.** Two tiers:

1. **`LxAnalyticsDaily` rollup table** — one row per day per dimension, written by a scheduled job (nightly, plus a lightweight incremental refresh every ~15 min for the current day). Charts read rollups.
2. **Redis cache in front**, key `lx:analytics:summary:{scopeHash}`, TTL 300s, invalidated on approval events.

The dashboard's four stat cards then cost one Redis GET, not five aggregate scans. Because they are approvals-driven, a 5-minute staleness is invisible to users.

If Redis is refused, tier 1 alone is still a large win — a rollup read is a single indexed lookup.

### 8.4 Danger 3 — the approvals aggregator

The queue unions pending rows from four tables. Naively that is four unbounded queries per page load, for the users who reload most often.

Constraints: each sub-query is bounded to the page size, uses its `(status, created_at)` index, and — critically — is **skipped entirely when the actor cannot approve that type**. FINANCE fetches only expenses; CLUB_HEAD gets an empty queue without touching the database. The pending _badge count_ is a separate cached integer (`lx:approvals:count:{role}`, TTL 60s), never a live count on every page render.

### 8.5 Caching layers

| Layer    | Contents                                                                                   | TTL                        | Invalidation                                 |
| -------- | ------------------------------------------------------------------------------------------ | -------------------------- | -------------------------------------------- |
| Redis    | analytics rollups, approval badge counts, feed page 1, room availability for current month | 60–300s                    | Explicit bust on approve/reject/point-change |
| Postgres | `LxAnalyticsDaily` rollups                                                                 | daily + 15-min incremental | Scheduled job                                |
| HTTP     | `Cache-Control` on public GETs (rooms, approved events)                                    | 30–60s                     | Natural expiry                               |
| Client   | RTK slice state                                                                            | session                    | Thunk refetch                                |

**No in-process caching.** The frontend kit's mock store keeps state on `globalThis` — a module-level singleton. That is exactly the pattern that silently breaks under horizontal scaling: two instances, two divergent caches, non-reproducible bugs. Shared state lives in Redis or Postgres, never in a Node module. **The application must be fully stateless.**

### 8.6 Connection pooling

The most likely way this falls over in production, and the least obvious. Prisma opens a connection pool **per process**. Postgres defaults to `max_connections = 100`. Ten RishiVerse instances × a default Prisma pool exhausts the server, and every request then fails on connection acquisition rather than anything visibly LXOS-related.

Requirements at integration:

- **PgBouncer in transaction mode** in front of Postgres.
- `?pgbouncer=true&connection_limit=N` on the datasource URL, with N sized to `(max_connections × 0.8) / instance_count`.
- No prepared statements incompatible with transaction pooling.
- Long transactions (the Serializable booking check) must stay short — they hold a pooled connection for their entire duration.

This is core's infrastructure, not ours, but LXOS adds load to it and the requirement belongs in the handoff notes.

### 8.7 File uploads

Bill images and achievement photos must **never** transit the Node process. Proxying uploads through Express blocks the event loop and turns a reimbursement deadline into an outage.

**Presigned direct-to-S3:**

```text
client → POST /api/v1/lx/file/presign   → { uploadUrl, fileKey }   (API: metadata only)
client → PUT  {uploadUrl}               → S3 directly              (API not involved)
client → POST /api/v1/lx/file/confirm   → row in lx_files          (API: metadata only)
```

Reads go through CDN URLs, not the API. Validate content-type and size limits in the presign step; treat the confirm step as untrusted until the object is verified to exist.

### 8.8 The activity feed

The feed is global, not per-user — every student sees the same stream. This removes the hardest problem in feed design: there is **no per-user fan-out**, no inbox tables, no fan-out-on-write to thousands of rows.

Design: a single denormalized `LxFeedEntry` table, appended in the same transaction that approves an achievement or publishes a club update. Denormalizing the display fields at write time means rendering the feed touches exactly one table with no joins.

Read path: keyset pagination on `(published_at DESC, id DESC)`, page 1 cached in Redis (60s) since it absorbs the overwhelming majority of feed traffic during a spike.

### 8.9 N+1 avoidance

The default failure mode with an ORM. Rules:

- Always `select` explicit fields. Never `include` an entire relation graph "just in case".
- Batch by id: `findMany({ where: { id: { in: ids } } })`, then map in memory.
- Resolving display names for a page of 20 events is **one** batched call to core's user service, not 20.
- Enable Prisma query logging in development and treat a per-row query in a loop as a review blocker.

### 8.10 Rate limiting and abuse

Per-actor limits on writes (event creation, expense submission, file presign), stricter limits on presign specifically since it is the gateway to storage cost. Search endpoints get their own bucket — see §9.3 for the client-side half of that problem.

### 8.11 What we are deliberately not building

Microservices, message brokers, sharding, event sourcing, CQRS read stores, multi-region. At 8,000 users these add operational cost and failure modes while solving nothing we have. If LXOS ever serves multiple universities, revisit — starting with §8.3 and §8.8.

---

## 9. Frontend architecture

### 9.1 Structure

Mandated by the kit and unchanged by us:

```text
src/features/lx/{entity}/    types.ts → {entity}Api.ts → {entity}Thunks.ts
                             → {entity}Slice.ts → {entity}Selectors.ts

src/app/(erp)/lx/{route}/    page.tsx → hooks/ → components/ → schemas/
```

Data flows one way: `page → hooks → thunks → api → axios`. Pages never import `*Api`. Shared components never import `features/`. No new top-level `src/` folders.

### 9.2 Route map

Naming rule, taken from the kit's `new-rishiverse-frontend-module` skill (`(erp)/{kebab-module}/{kebab-entity}/`) and its demo route `(erp)/demo/item`: **route segments are singular and mirror the backend kebab-entity** wherever an endpoint exists. View-only pages that front no single entity keep a descriptive name.

| Route                       | Page                                              | Access                  |
| --------------------------- | ------------------------------------------------- | ----------------------- |
| `/lx/dashboard`             | stat cards, next-up, quick actions, pending badge | all                     |
| `/lx/event`                 | list, filters, create/edit drawer                 | all (scoped)            |
| `/lx/room`                  | list + booking calendar                           | all                     |
| `/lx/calendar`              | month/week/day                                    | all                     |
| `/lx/club`, `/lx/club/[id]` | profiles, budget, updates                         | all                     |
| `/lx/clan`, `/lx/clan/[id]` | leaderboard, analytics, initiatives               | all                     |
| `/lx/achievement`           | search, person filter, submit                     | all                     |
| `/lx/reimbursement`         | list, submit, detail timeline                     | scoped                  |
| `/lx/budget`                | allocation vs spend                               | ADMIN, FINANCE          |
| `/lx/approval`              | unified queue                                     | ADMIN, LX_TEAM, FINANCE |
| `/lx/feed`                  | activity stream                                   | all                     |
| `/lx/analytics`             | charts                                            | ADMIN, LX_TEAM, FINANCE |
| `/lx/file`                  | repository                                        | all                     |

Hooks follow `use{Entity}s`; pages export `default function {Entity}Page()`; thunks are `fetch{Entity}sThunk` / `create{Entity}Thunk`.

### 9.3 A bug in the golden example we must not copy

The kit's `useDemoItems` hook wires `search` into a `useCallback` dependency and calls it from `useEffect`:

```ts
const refresh = useCallback(() => {
  void dispatch(fetchItemsThunk({ search: search || undefined, … }));
}, [dispatch, search]);
useEffect(() => { refresh(); }, [refresh]);
```

This fires **one API request per keystroke**. On a demo with one row it is invisible. On achievement search across every student, with a few hundred people typing during a spike, it is a self-inflicted denial of service.

Every LXOS search input debounces at 300ms and aborts the in-flight request on change. This is a required review item, not a nice-to-have.

### 9.4 Rendering and payload

- Server Components for static shells; `"use client"` only where interactivity demands it.
- Charts (`recharts`) and the calendar are heavy — dynamic-import them so the dashboard is not blocked by the analytics bundle.
- Lists are paginated at the API; never fetch-all-then-filter-in-the-browser.
- Normalize entities in RTK slices; avoid storing the same row in three slices.

### 9.5 The missing edit pattern

The kit's golden example implements list, create, and delete — **there is no update pattern**, and the mock API has no `PATCH`. LXOS needs editing nearly everywhere. Phase 1 therefore establishes the canonical edit drawer once (event edit), and every later module copies it. It should be flagged to maintainers as a candidate addition to the kit's demo (§12.3).

---

## 10. Cross-cutting concerns

### 10.1 Transactions

Operations spanning tables run in one transaction: event + room bookings; achievement approval + clan point txn + clan cache + feed entry; expense approval + audit row. `Serializable` only where correctness demands it (booking); `ReadCommitted` elsewhere. Transactions stay short — §8.6.

### 10.2 Concurrency on approvals

Two admins clicking Approve simultaneously must not both succeed. No table locks needed — a conditional update expresses it exactly:

```js
const { count } = await tx.lxEvent.updateMany({
    where: { id: eventId, status: "PENDING", deletedAt: null },
    data: { status: "APPROVED", reviewedByRef: actor.referenceId, reviewedAt: new Date() },
});
if (count === 0) {
    return { success: false, statusCode: 409, message: "Already actioned by someone else" };
}
```

The `status: 'PENDING'` predicate makes the transition atomic. The loser gets a clean 409 instead of silently overwriting. **This pattern is mandatory for every state transition, and non-negotiable for anything touching money.**

### 10.3 Idempotency

Money endpoints (expense submission, finance processing) accept an `Idempotency-Key` header stored with the row, so a retried request returns the original result rather than creating a duplicate payout.

### 10.4 Audit log

`LxAuditLog` is append-only: `actorRef`, `action`, `entityType`, `entityId`, `before`, `after`, `createdAt`. Written for every approval, rejection, point change, budget allocation, and money movement. This is what makes the manual's "no disputes" claim true, and it is the first thing anyone will ask for when a dispute happens anyway.

### 10.5 Observability

`createContextLogger` per module with structured metadata. Log slow queries (>200ms), serialization retries, cache hit rate, and every 409. At integration these route into core's logging stack.

### 10.6 Errors

The kit's `handleControllerErrorResponse` handles Zod and unexpected errors. LXOS adds typed domain failures returned as service result objects, never thrown: `409` room conflict, `409` already-actioned, `403` out of scope, `422` budget exceeded.

---

## 11. Security and privacy

### 11.1 Bank account details

Reimbursements collect bank account numbers and IFSC codes — the most sensitive data in the platform, and something the kit has no story for.

Position: **LXOS should not become a store of bank credentials without an explicit decision from RishiVerse.** Options, in order of preference:

1. Reference an existing core payout/vendor record instead of storing anything.
2. Store encrypted at rest (application-level envelope encryption, key in core's secret manager), returning only a masked last-4 on read.
3. Store plaintext — **not acceptable**; listed only to be ruled out.

Whichever is chosen: never log these fields, never include them in list responses, restrict reads to FINANCE and ADMIN, and audit every access. Flagged as a blocking decision in §12.3.

### 11.2 Access control

Verb gating and data scoping per §6. Every list endpoint is scoped in the DAL; no endpoint returns rows the actor may not see, even if the UI would hide them. **UI hiding is not access control.**

### 11.3 Files

Presigned URLs are short-lived. Private objects are not publicly readable; reads are brokered by short-lived signed CDN URLs. File rows carry an `visibility` field, and the repository listing is scoped like any other list.

### 11.4 Input and injection

Zod at every controller boundary. Prisma parameterizes queries, so raw SQL is avoided; where unavoidable, `$queryRaw` with tagged parameters only — never string interpolation. `sortBy`/`sortOrder` come from constant allow-lists (the kit already does this correctly and it must be preserved — an unvalidated `orderBy` key is an injection vector).

### 11.5 Institutional email restriction

Enforced by core's auth at integration. In the kit the actor stub does not authenticate anything and must never be reachable in a deployed environment.

---

## 12. Delivery plan and open decisions

### 12.1 Slug risk — accepted, but stated

`lx` is **not yet reserved** with maintainers. The slug appears in ~8 backend directory paths, every API URL, the frontend route group, the feature folder, and the release tag. A late change is a mechanical rename but touches essentially every file.

Mitigation: reserve `lx` before Phase 2 begins. Phase 1 is small enough to rename cheaply; Phase 3 is not.

### 12.2 Phases

| Phase | Contents                                                                                                                    | Exit criterion                                                                          |
| ----- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **1** | members, rooms, events, room bookings, approvals aggregator; frontend dashboard/events/rooms/approvals; edit-drawer pattern | Full slice runs against real Postgres; conflict prevention proven under concurrent load |
| **2** | clubs, club updates, clans, point ledger, initiatives, achievements, feed                                                   | Point ledger reconciles; feed keyset pagination verified on seeded volume               |
| **3** | expenses, budget, analytics rollups, files, audit log                                                                       | Money paths idempotent and audited; analytics served from rollups                       |
| **4** | partners, collaborations, fest, vendors — **if in scope**                                                                   | —                                                                                       |

Phase 1 deliberately front-loads the hardest patterns — cross-domain aggregation, transactional conflict prevention, actor scoping, the edit pattern — so that mistakes are found before they are replicated across ~120 files.

### 12.3 Decisions required from maintainers

Ordered by how much rework a late answer causes.

| #   | Decision                                                      | Blocks            | Our recommendation                                       |
| --- | ------------------------------------------------------------- | ----------------- | -------------------------------------------------------- |
| 1   | Reserve module slug `lx`                                      | Everything        | Approve `lx`                                             |
| 2   | Bank detail storage (§11.1)                                   | Phase 3           | Reference core records; else encrypt + mask              |
| 3   | Exclusion constraint + partial indexes migration (§7.2, §7.3) | Phase 1 exit      | Approve; app-level check ships meanwhile                 |
| 4   | Cursor pagination envelope variant (§8.2)                     | Phase 1 API shape | Approve the additive variant                             |
| 5   | `PATCH /:id/decision` sub-resource (§5.4)                     | Phase 1 API shape | Approve; state transitions ≠ field updates               |
| 6   | Dependency list (§3.4)                                        | Phase 1–3         | Approve after checking monorepo for existing equivalents |
| 7   | `LxMember.referenceId` → real FK to core `User`               | Integration       | Promote to FK at integration                             |
| 8   | Is Partners & Fest in scope? (§1.2)                           | Phase 4           | Clarify before Phase 3 ends                              |
| 9   | PgBouncer sizing for added LXOS load (§8.6)                   | Production        | Core infrastructure decision                             |
| 10  | Trigram search index for achievements (§7.4)                  | Phase 2           | Approve before achievement volume grows                  |

### 12.4 Known kit defects affecting delivery

Found while validating the scaffolds; both need resolution because kit rules make them handoff gates.

- **Frontend `npm run lint` is broken.** `next lint` was removed in Next 16; the script errors, and the repo contains no ESLint config, while `eslint-config-next` is pinned to `^15.5.0` against `next ^16.0.7`. `RULES.md` §16 makes passing lint a handoff gate, so this must be fixed — but it is a kit standard, so the fix needs maintainer approval rather than a unilateral patch.
- **Backend sends no CORS headers** and has no committed lockfile. See §3.4.
- **`next dev` generates untracked `AGENTS.md` / `CLAUDE.md`** in the frontend root on every run; they are not gitignored and will dirty every vendor's PR.

---

## Appendix A — Definition of done, per entity

An entity is complete when: Prisma model + mirror file exist; constants declare its enums and sort allow-lists; Zod schemas cover create/update/list; the DAL applies scoping and soft-delete; the service returns result objects and holds transactions; the controller gates permission, parses, and maps the envelope; routes are wired into `lxRoutes.js`; indexes match the actual query patterns; `docs/lx.md` lists the endpoints; and a curl sequence covers happy path, validation failure, permission denial, and concurrent-conflict where applicable.

## Appendix B — Source documents

- LX Management OS Product Manual, June 2026 (35pp), Neelanshu Karn
- LXOS platform overview, `learnerexperienceos.vercel.app`
- `rishiverse-backend-module-scaffold`: `ARCHITECTURE.md`, `DESIGN.md`, `RULES.md`, `docs/MULTI_TEAM.md`, `docs/CONTRACTS.md`, `docs/HANDOFF.md`
- `rishiverse-frontend-module-scaffold`: `ARCHITECTURE.md`, `DESIGN.md`, `RULES.md`, `docs/HANDOFF.md`
