// Money handling for LX.
//
// Every rupee amount in this module — budgets, expenses, reimbursements — is a
// Postgres `numeric(12,2)` and reaches JavaScript as a Prisma `Decimal`, not a
// `number`. That is deliberate. These columns used to be `Float`
// (double precision), and `z.number()` accepts fractional input, so a claim of
// ₹1234.57 was stored as the nearest binary double. One of those is invisible;
// thousands of `increment` operations against a club budget are not, and the
// failure mode is a budget that quietly disagrees with the sum of its own
// expenses by a few paise.
//
// Two rules follow:
//
//   1. ACCUMULATE IN THE DATABASE. `{ increment: amount }` on a numeric column
//      is exact. Never read a balance into JS, add to it, and write it back —
//      that is both lossy and a lost-update race.
//   2. CONVERT ONLY AT THE EDGE. Decimal stays Decimal through the service
//      layer; `toMoney` is for the moment a value becomes JSON, so the API
//      contract stays a plain number and no client has to learn about Decimal.

const SCALE = 2;

/**
 * A Prisma Decimal, a number, a numeric string or null → a plain number rounded
 * to paise. Used at the API boundary so responses keep their existing shape.
 */
export const toMoney = (value) => {
    if (value === null || value === undefined) return 0;

    // Prisma Decimal (decimal.js) exposes toFixed, which rounds in decimal
    // rather than binary — this is the whole point of the type.
    if (typeof value === "object" && typeof value.toFixed === "function") {
        return Number(value.toFixed(SCALE));
    }

    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.round(n * 100) / 100;
};

/**
 * Exact sum of a list of money values.
 *
 * Accumulates in integer paise, so a report totalling several thousand rows
 * cannot drift the way `reduce((s, x) => s + x, 0)` over doubles can.
 */
export const sumMoney = (values) => {
    const paise = values.reduce((acc, v) => acc + Math.round(toMoney(v) * 100), 0);
    return paise / 100;
};

/**
 * True when a client-supplied amount is expressible in paise.
 *
 * The validators reject anything finer, which stops a value that cannot be
 * stored exactly from entering the system in the first place.
 */
export const isPaiseExact = (n) =>
    Number.isFinite(n) && Math.abs(n * 100 - Math.round(n * 100)) < 1e-9;
