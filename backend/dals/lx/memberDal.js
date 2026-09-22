// ---------------------------------------------------------------------------
// LX membership + identity lookups. The ONLY place that queries LxMember.
//
// Both callers used to hold Prisma themselves — identityService (a service) and
// lxActor (middleware) — which broke the layering rule in two directions at
// once. Routing them through here means the production swap is a change to
// these functions alone: at handoff `findMemberByReferenceIdDal` keeps its
// signature and `findDisplayNamesByRefsDal` becomes the batched core query
// against User + Student + Employee.
// ---------------------------------------------------------------------------
import createContextLogger from "../../logger/contextLogger.js";
import prisma from "../../services/prismaClient.js";

const logger = createContextLogger("memberDal");

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
 * The LX overlay row for a core `User.referenceId`.
 * Used by the actor resolver on every request, so it stays a single indexed
 * lookup on a unique column.
 */
export const findMemberByReferenceIdDal = wrap("findMemberByReferenceIdDal", (referenceId) =>
    prisma.lxMember.findFirst({ where: { referenceId, isActive: true } }),
);

/** First seeded admin — the kit's fallback actor. DEV-SHIM ONLY. */
export const findFallbackAdminDal = wrap("findFallbackAdminDal", () =>
    prisma.lxMember.findFirst({
        where: { role: "ADMIN", isActive: true },
        orderBy: { createdAt: "asc" },
    }),
);

/**
 * Display names for a set of referenceIds, in ONE query.
 *
 * AT HANDOFF this becomes the core lookup and nothing else changes:
 *
 *   prisma.user.findMany({
 *     where: { referenceId: { in: refs }, deletedAt: null },
 *     select: {
 *       referenceId: true, userType: true,
 *       student:  { select: { fullName: true, firstName: true, lastName: true } },
 *       employee: { select: { firstName: true, lastName: true } },
 *     },
 *   })
 *
 * Never select `Student.bank*` here — that is PII and belongs to finance flows.
 */
export const findDisplayNamesByRefsDal = wrap("findDisplayNamesByRefsDal", (refs) =>
    prisma.lxMember.findMany({
        where: { referenceId: { in: refs } },
        select: { referenceId: true, displayName: true },
    }),
);
