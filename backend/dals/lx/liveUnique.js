// Uniqueness among LIVE rows, for tables that soft-delete.
//
// A plain `@unique` on a soft-deleting table is a trap: once a club is deleted
// its name stays reserved for ever, and creating a new club with that name
// fails with P2002 even though nothing visible holds it. That is a real bug,
// reproduced against the dev database before this was written.
//
// Postgres expresses the correct rule as a partial index:
//
//     CREATE UNIQUE INDEX lx_clubs_name_live_key
//       ON lx_clubs (name) WHERE deleted_at IS NULL;
//
// Prisma's schema language cannot declare that, and this module does not ship
// migrations, so the column-level `@unique` was removed and the guarantee is
// enforced here until the maintainer migration adds the index. The check runs
// inside the caller's transaction, which closes all but a very narrow race —
// the partial index is what closes it completely, so it should still land.

/**
 * Throw a Prisma-shaped P2002 if another LIVE row already holds `value`.
 *
 * Shaped as P2002 on purpose: `responseUtils` already maps that to 409, so a
 * duplicate name returns the same status whether it was caught here or by the
 * database index once it exists.
 *
 * @param tx      a Prisma transaction client
 * @param model   delegate name, e.g. "lxClub"
 * @param field   column to check, e.g. "name"
 * @param value   the candidate value
 * @param ignoreId row to exclude, for updates
 */
export const assertLiveUnique = async (tx, model, field, value, ignoreId = null) => {
    if (value === undefined || value === null) return;

    const clash = await tx[model].findFirst({
        where: {
            [field]: value,
            deletedAt: null,
            ...(ignoreId ? { id: { not: ignoreId } } : {}),
        },
        select: { id: true },
    });

    if (clash) {
        const error = new Error(`A ${model} with this ${field} already exists`);
        error.code = "P2002";
        error.meta = { target: [field] };
        throw error;
    }
};
