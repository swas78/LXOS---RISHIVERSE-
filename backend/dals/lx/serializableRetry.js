// Retry helper for Serializable transactions.
//
// Serializable is the right isolation level for anything that reads a value and
// writes a derived one — clan points, room-booking overlap — because Postgres
// then refuses to let two of them interleave into a lost update. The cost is
// that the loser is aborted with SQLSTATE 40001 (`serialization_failure`)
// rather than silently producing a wrong answer.
//
// That abort is the database doing its job, not an error the caller did
// anything about, so it must be retried rather than returned. Without this, the
// concurrency fix trades "silently wrong" for "500 under load", which is not
// obviously an improvement.
//
// Measured on the dev database: five simultaneous point awards produced three
// commits and two 40001 aborts. With this wrapper all five commit, and the
// running total and the ledger still agree.

// Postgres SQLSTATEs, and Prisma's own wrapper for them. Prisma does not pass
// 40001 through — it raises P2034 ("Transaction failed due to a write conflict
// or a deadlock"), so matching only the SQLSTATE silently retries nothing.
// Found the hard way: the first version of this caught none of five colliding
// bookings, which then surfaced as 500s instead of a clean 409.
const RETRYABLE = new Set([
    "40001", // serialization_failure
    "40P01", // deadlock_detected
    "P2034", // Prisma: write conflict or deadlock
]);

const isRetryable = (error) =>
    RETRYABLE.has(error?.code) ||
    RETRYABLE.has(error?.meta?.code) ||
    /write conflict or a deadlock/i.test(error?.message ?? "");

/**
 * Run `fn` and retry it while Postgres reports a serialization failure.
 *
 * Backoff is randomised: two writers retrying on the same fixed schedule just
 * collide again.
 *
 * @param fn        the operation — must be the whole transaction, not part of it
 * @param attempts  total tries, including the first
 */
export const withSerializableRetry = async (fn, attempts = 5) => {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (!isRetryable(error) || attempt === attempts) throw error;
            lastError = error;
            const backoffMs = Math.round(Math.random() * 20 * attempt) + 5;
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
    }
    throw lastError;
};
