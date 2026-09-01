// Shared pure helpers for LX modules. No Prisma, no HTTP.

// Normalize an "asc"/"desc" string to a Prisma sort order.
export const normalizeSortOrder = (order, fallback = 'desc') =>
  String(order || fallback).toLowerCase() === 'asc' ? 'asc' : 'desc';

// Build the standard pagination block from a total count.
export const buildPagination = (page, limit, totalRecords) => ({
  page,
  limit,
  totalRecords,
  hasNextPage: page * limit < totalRecords,
  hasPreviousPage: page > 1,
});

// Compute skip for a page/limit pair.
export const pageSkip = (page, limit) => (page - 1) * limit;

// Snapshot the acting user onto a create payload (denormalized creator fields).
// Modules pass req.actor here so reads never need to join the (dev) user table.
export const actorSnapshot = (actor) => ({
  createdById: actor?.id ?? 'unknown',
  createdByName: actor?.name ?? 'Unknown',
  createdByRole: actor?.role ?? null,
});

// Two datetime ranges overlap if each starts before the other ends.
export const rangesOverlap = (startA, endA, startB, endB) =>
  new Date(startA) < new Date(endB) && new Date(startB) < new Date(endA);
