// Shared pure helpers for LX modules. No Prisma, no HTTP.

// Normalize an "asc"/"desc" string to a Prisma sort order.
export const normalizeSortOrder = (order, fallback = 'desc') =>
  String(order || fallback).toLowerCase() === 'asc' ? 'asc' : 'desc';

// Build the standard pagination block from a total count.
//
// EXACTLY core's `buildPaginationMeta`: { page, limit, totalCount, totalPages }.
// Nothing more. The kit previously added hasNextPage / hasPreviousPage, which
// clients then read — making the kit's response shape a superset of core's and
// quietly guaranteeing a break at integration. A client can derive both from
// page and totalPages.
export const buildPagination = (page, limit, totalCount) => ({
  page,
  limit,
  totalCount,
  totalPages: limit > 0 ? Math.ceil(totalCount / limit) : 0,
});

// Core's default page size. The kit used 12 (and 24/50/60 in places), which
// silently changes how every list paginates once it lands in core.
export const DEFAULT_PAGE_LIMIT = 10;

// Compute skip for a page/limit pair.
export const pageSkip = (page, limit) => (page - 1) * limit;

// Snapshot the acting user onto a create payload.
//
// `createdByRef` is core `User.referenceId` and IS the source of truth.
// `createdByName` is a read cache that may drift — see the `/// CACHE` notes in
// prisma/models/lx/. Anything that must be correct resolves the name at read
// time via services/lx/identityService.js.
export const actorSnapshot = (actor) => ({
  createdByRef: actor?.referenceId ?? 'unknown',
  createdByName: actor?.displayName ?? null,
  createdByRole: actor?.role ?? null,
});

// Two datetime ranges overlap if each starts before the other ends.
export const rangesOverlap = (startA, endA, startB, endB) =>
  new Date(startA) < new Date(endB) && new Date(startB) < new Date(endA);
