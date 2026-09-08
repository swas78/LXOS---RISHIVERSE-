// Shared pure helpers for LX modules. No Prisma, no HTTP.

// Normalize an "asc"/"desc" string to a Prisma sort order.
export const normalizeSortOrder = (order, fallback = 'desc') =>
  String(order || fallback).toLowerCase() === 'asc' ? 'asc' : 'desc';

// Build the standard pagination block from a total count.
//
// Shape is fixed by lxos-core-pack/api-envelope.md — core's own
// `buildPaginationMeta` returns exactly { page, limit, totalCount, totalPages }.
// `hasNextPage` / `hasPreviousPage` are additive conveniences for the kit UI;
// they can be dropped at handoff without breaking core clients.
export const buildPagination = (page, limit, totalCount) => ({
  page,
  limit,
  totalCount,
  totalPages: limit > 0 ? Math.ceil(totalCount / limit) : 0,
  hasNextPage: page * limit < totalCount,
  hasPreviousPage: page > 1,
});

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
