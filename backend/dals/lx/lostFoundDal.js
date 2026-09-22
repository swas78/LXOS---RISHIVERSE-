import createContextLogger from "../../logger/contextLogger.js";
import prisma from "../../services/prismaClient.js";
import { buildPagination, normalizeSortOrder, pageSkip } from "../../helper/lxHelper.js";

const logger = createContextLogger("lostFoundDal");

const wrap =
    (name, fn) =>
    async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            logger.error(`Error in ${name}`, {
                error: { message: error.message, stack: error.stack },
            });
            throw error;
        }
    };

/**
 * @param {object} query  validated list query
 * @param {object} visibility  Prisma `where` fragment from helper/lxScope.js
 *   deciding WHICH rows this actor may see. Kept separate from the caller's
 *   own filters so a user's choice can never widen their access.
 */
export const getAllLostFoundDal = wrap("getAllLostFoundDal", async (query, visibility = {}) => {
    const { search, kind, category, status, page, limit, sortBy, sortOrder } = query;

    const where = {
        deletedAt: null,
        ...visibility,
        ...(kind ? { kind } : {}),
        ...(category ? { category } : {}),
        ...(status ? { status } : {}),
        ...(search
            ? {
                  OR: [
                      { title: { contains: search, mode: "insensitive" } },
                      { description: { contains: search, mode: "insensitive" } },
                      { location: { contains: search, mode: "insensitive" } },
                  ],
              }
            : {}),
    };

    const [data, totalCount] = await Promise.all([
        prisma.lxLostFoundItem.findMany({
            where,
            orderBy: { [sortBy]: normalizeSortOrder(sortOrder) },
            skip: pageSkip(page, limit),
            take: limit,
        }),
        prisma.lxLostFoundItem.count({ where }),
    ]);

    return { data, ...buildPagination(page, limit, totalCount) };
});

export const getLostFoundByIdDal = wrap("getLostFoundByIdDal", (id) =>
    prisma.lxLostFoundItem.findFirst({ where: { id, deletedAt: null } }),
);

export const createLostFoundDal = wrap("createLostFoundDal", (data) =>
    prisma.lxLostFoundItem.create({ data }),
);

export const updateLostFoundDal = wrap("updateLostFoundDal", (id, data) =>
    prisma.lxLostFoundItem.update({ where: { id }, data }),
);

export const softDeleteLostFoundDal = wrap("softDeleteLostFoundDal", (id) =>
    prisma.lxLostFoundItem.update({ where: { id }, data: { deletedAt: new Date() } }),
);

/** Counts for the board's tab badges, in one grouped query. */
export const countLostFoundByStatusDal = wrap("countLostFoundByStatusDal", (visibility = {}) =>
    prisma.lxLostFoundItem.groupBy({
        by: ["status"],
        where: { deletedAt: null, ...visibility },
        _count: { _all: true },
    }),
);

/** Pending rows for the unified approvals queue. */
export const getPendingLostFoundDal = wrap("getPendingLostFoundDal", () =>
    prisma.lxLostFoundItem.findMany({
        where: { deletedAt: null, status: "PENDING" },
        orderBy: { createdAt: "desc" },
    }),
);

/**
 * Approve or reject from the unified queue. Guarded on `status: 'PENDING'` so
 * two reviewers clicking at once cannot both act — the loser sees the row is
 * already decided rather than silently overwriting the first decision.
 */
export const actOnLostFoundDal = wrap(
    "actOnLostFoundDal",
    async (id, action, actor, rejectionReason) => {
        const existing = await prisma.lxLostFoundItem.findFirst({ where: { id, deletedAt: null } });
        if (!existing) return null;
        if (existing.status !== "PENDING") return { error: "Already actioned by someone else" };

        const data =
            action === "approve"
                ? {
                      status: "APPROVED",
                      approvedByRef: actor?.referenceId ?? null,
                      approvedByName: actor?.displayName ?? null,
                      approvedAt: new Date(),
                      rejectionReason: null,
                  }
                : {
                      status: "REJECTED",
                      approvedByRef: actor?.referenceId ?? null,
                      approvedByName: actor?.displayName ?? null,
                      approvedAt: new Date(),
                      rejectionReason: rejectionReason ?? null,
                  };

        return prisma.lxLostFoundItem.update({ where: { id }, data });
    },
);
