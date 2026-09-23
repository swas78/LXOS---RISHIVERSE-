import createContextLogger from "../../logger/contextLogger.js";
import prisma from "../../services/prismaClient.js";
import { assertLiveUnique } from "./liveUnique.js";
import { withSerializableRetry } from "./serializableRetry.js";

const logger = createContextLogger("clanDal");

export const createClanDal = async ({
    name,
    color,
    points,
    budgetAllocated,
    budgetSpent,
    semester,
    description,
}) => {
    try {
        return await prisma.$transaction(async (tx) => {
            // Name is unique among live rows only — see dals/lx/liveUnique.js.
            await assertLiveUnique(tx, "lxClan", "name", name);
            return await tx.lxClan.create({
                data: {
                    name,
                    color,
                    ...(points !== undefined ? { points } : {}),
                    ...(budgetAllocated !== undefined ? { budgetAllocated } : {}),
                    ...(budgetSpent !== undefined ? { budgetSpent } : {}),
                    ...(semester !== undefined ? { semester } : {}),
                    ...(description !== undefined ? { description } : {}),
                },
            });
        });
    } catch (error) {
        logger.error("Error in createClanDal", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const getClanByIdDal = async (clanId) => {
    try {
        return await prisma.lxClan.findFirst({
            where: { id: clanId, deletedAt: null },
            include: {
                pointTxns: {
                    orderBy: { date: "desc" },
                },
            },
        });
    } catch (error) {
        logger.error("Error in getClanByIdDal", {
            error: { message: error.message, stack: error.stack },
            clanId,
        });
        throw error;
    }
};

export const getAllClansDal = async ({ search, page, limit, sortBy, sortOrder }) => {
    try {
        const where = {
            deletedAt: null,
            ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
        };

        const normalizedSortOrder =
            String(sortOrder || "desc").toLowerCase() === "asc" ? "asc" : "desc";
        const skip = (page - 1) * limit;

        const [clans, total] = await Promise.all([
            prisma.lxClan.findMany({
                where,
                orderBy: { [sortBy]: normalizedSortOrder },
                skip,
                take: limit,
            }),
            prisma.lxClan.count({ where }),
        ]);

        return {
            page,
            limit,
            totalCount: total,
            totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
            data: clans,
        };
    } catch (error) {
        logger.error("Error in getAllClansDal", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const updateClanDal = async (clanId, data) => {
    try {
        return await prisma.$transaction(async (tx) => {
            await assertLiveUnique(tx, "lxClan", "name", name, id);
            return await tx.lxClan.update({
                where: { id: clanId },
                data,
            });
        });
    } catch (error) {
        logger.error("Error in updateClanDal", {
            error: { message: error.message, stack: error.stack },
            clanId,
        });
        throw error;
    }
};

export const deleteClanDal = async (clanId) => {
    try {
        return await prisma.lxClan.update({
            where: { id: clanId },
            data: { deletedAt: new Date() },
        });
    } catch (error) {
        logger.error("Error in deleteClanDal", {
            error: { message: error.message, stack: error.stack },
            clanId,
        });
        throw error;
    }
};

// Apply a point change and append to the (append-only) ledger.
//
// The delta is applied INSIDE a Serializable transaction that re-reads the
// clan, rather than the caller reading `points`, adding to it, and writing the
// result back. That earlier shape was a lost update: two admins awarding points
// at the same moment both read the same total, and the second write silently
// discarded the first — leaving the ledger's `previousPoints` wrong as well.
//
// Serializable matches what the room-booking path already uses, so the module
// has one concurrency story rather than two.
export const applyClanPointsDal = async ({
    clanId,
    delta,
    reason,
    createdByRef,
    createdByName,
}) => {
    try {
        // Serializable aborts the loser of a race with 40001; retry it rather
        // than hand the caller a 500 for something the database handled.
        return await withSerializableRetry(() =>
            prisma.$transaction(
                async (tx) => {
                    const clan = await tx.lxClan.findFirst({
                        where: { id: clanId, deletedAt: null },
                        select: { id: true, points: true },
                    });
                    if (!clan) return null;

                    const previousPoints = clan.points;
                    // Points floor at zero; a -50 against a total of 20 lands on 0,
                    // and the ledger records the real applied delta, not the asked one.
                    const newPoints = Math.max(0, previousPoints + delta);

                    await tx.lxClan.update({
                        where: { id: clanId },
                        data: { points: newPoints },
                    });
                    await tx.lxClanPointTxn.create({
                        data: {
                            clanId,
                            delta: newPoints - previousPoints,
                            points: newPoints,
                            previousPoints,
                            reason,
                            ...(createdByRef !== undefined ? { createdByRef } : {}),
                            ...(createdByName !== undefined ? { createdByName } : {}),
                        },
                    });
                    return { previousPoints, newPoints };
                },
                { isolationLevel: "Serializable" },
            ),
        );
    } catch (error) {
        logger.error("Error in applyClanPointsDal", {
            error: { message: error.message, stack: error.stack },
            clanId,
        });
        throw error;
    }
};
