// ---------------------------------------------------------------------------
// LX identity resolution — turning referenceIds into display names.
//
// WHY THIS EXISTS (lxos-core-pack/identity.md §"Resolving display names")
// -----------------------------------------------------------------------
// LX rows store `*ByRef` (core `User.referenceId`) as the source of truth and
// keep `*ByName` only as a drift-prone cache. Core's rule is "resolve at read,
// do not copy identity". This service is that resolver: ONE batched lookup per
// page of rows, never a query per row.
//
// KIT vs PRODUCTION
// -----------------
// The kit has no `User` / `Student` / `Employee` tables, so `resolveNames`
// reads `LxMember.displayName`. At handoff, swap the body of `fetchNames` for
// the core query below and delete nothing else — callers are unchanged:
//
//   const rows = await prisma.user.findMany({
//     where: { referenceId: { in: refs }, deletedAt: null },
//     select: {
//       referenceId: true,
//       userType: true,
//       student:  { select: { fullName: true, firstName: true, lastName: true, userProfileImg: true } },
//       employee: { select: { firstName: true, lastName: true, userProfileImg: true } },
//     },
//   });
//   // display name = student.fullName ?? `${employee.firstName} ${employee.lastName}`
//
// Never select `Student.bank*` here — that is PII and belongs to finance flows
// only (lxos-core-pack/payouts.md).
// ---------------------------------------------------------------------------
import prisma from '../prismaClient.js';

// Fields on LX rows that hold a referenceId, paired with the cache column the
// resolved name should be written back onto.
export const REF_NAME_PAIRS = [
  ['createdByRef', 'createdByName'],
  ['approvedByRef', 'approvedByName'],
  ['submittedByRef', 'submittedByName'],
  ['verifiedByRef', 'verifiedByName'],
  ['reviewedByRef', 'reviewedByName'],
  ['processedByRef', 'processedByName'],
  ['uploadedByRef', 'uploadedByName'],
  ['requestedByRef', 'requestedByName'],
  ['completedByRef', 'completedByName'],
];

// KIT IMPLEMENTATION — replace this one function at handoff (see header).
const fetchNames = async (refs) => {
  const members = await prisma.lxMember.findMany({
    where: { referenceId: { in: refs } },
    select: { referenceId: true, displayName: true },
  });
  return new Map(
    members.map((m) => [m.referenceId, m.displayName ?? m.referenceId]),
  );
};

/**
 * Resolve a set of referenceIds to display names in a single query.
 * @param {string[]} refs
 * @returns {Promise<Map<string, string>>} referenceId -> display name
 */
export const resolveNames = async (refs) => {
  const unique = [...new Set((refs ?? []).filter(Boolean))];
  if (unique.length === 0) return new Map();
  return fetchNames(unique);
};

/**
 * Hydrate the `*ByName` cache columns on a page of rows from one batched
 * lookup. Rows are returned as new objects; the database is not written to —
 * the cache on disk stays whatever it was, and this is the read-time truth.
 *
 * @template T
 * @param {T[]} rows
 * @returns {Promise<T[]>}
 */
export const hydrateNames = async (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return rows;

  const refs = [];
  for (const row of rows) {
    for (const [refKey] of REF_NAME_PAIRS) {
      if (row?.[refKey]) refs.push(row[refKey]);
    }
  }

  const names = await resolveNames(refs);
  if (names.size === 0) return rows;

  return rows.map((row) => {
    const patch = {};
    for (const [refKey, nameKey] of REF_NAME_PAIRS) {
      const ref = row?.[refKey];
      if (ref && names.has(ref)) patch[nameKey] = names.get(ref);
    }
    return Object.keys(patch).length > 0 ? { ...row, ...patch } : row;
  });
};

/** Single-row convenience wrapper around {@link hydrateNames}. */
export const hydrateRowNames = async (row) => {
  if (!row) return row;
  const [hydrated] = await hydrateNames([row]);
  return hydrated;
};

export default { resolveNames, hydrateNames, hydrateRowNames, REF_NAME_PAIRS };
