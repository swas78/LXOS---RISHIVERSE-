import createContextLogger from "../../logger/contextLogger.js";
import { redactClan, redactClans } from "../../helper/lxScope.js";
import {
    applyClanPointsDal,
    createClanDal,
    deleteClanDal,
    getAllClansDal,
    getClanByIdDal,
    updateClanDal,
} from "../../dals/lx/clanDal.js";

const logger = createContextLogger("clanService");

export const createClanService = async (payload) => {
    try {
        const clan = await createClanDal(payload);
        if (!clan) {
            return { success: false, message: "Unable to create clan", statusCode: 400 };
        }
        return {
            success: true,
            message: "Clan created successfully",
            statusCode: 201,
            data: clan,
        };
    } catch (error) {
        logger.error("Error in createClanService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const getClanByIdService = async (clanId, actor) => {
    try {
        const clan = await getClanByIdDal(clanId);
        if (!clan) {
            return { success: false, message: "Clan not found", statusCode: 404 };
        }
        // Budget columns are scoped to finance roles and this clan's own head.
        // `points` is deliberately NOT redacted — the leaderboard is public.
        return {
            success: true,
            message: "Clan found",
            statusCode: 200,
            data: redactClan(clan, actor),
        };
    } catch (error) {
        logger.error("Error in getClanByIdService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const getAllClansService = async (query, actor) => {
    try {
        const result = await getAllClansDal(query);
        if (!result) {
            return { success: false, message: "Unable to list clans", statusCode: 400 };
        }
        return {
            success: true,
            message: "Clans fetched successfully",
            statusCode: 200,
            data: redactClans(result.data, actor),
            pagination: {
                page: result.page,
                limit: result.limit,
                totalCount: result.totalCount,
                totalPages: result.totalPages,
            },
        };
    } catch (error) {
        logger.error("Error in getAllClansService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const updateClanService = async (clanId, payload) => {
    try {
        const existing = await getClanByIdDal(clanId);
        if (!existing) {
            return { success: false, message: "Clan not found", statusCode: 404 };
        }
        const clan = await updateClanDal(clanId, payload);
        if (!clan) {
            return { success: false, message: "Unable to update clan", statusCode: 400 };
        }
        return {
            success: true,
            message: "Clan updated successfully",
            statusCode: 200,
            data: clan,
        };
    } catch (error) {
        logger.error("Error in updateClanService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const deleteClanService = async (clanId) => {
    try {
        const existing = await getClanByIdDal(clanId);
        if (!existing) {
            return { success: false, message: "Clan not found", statusCode: 404 };
        }
        const clan = await deleteClanDal(clanId);
        if (!clan) {
            return { success: false, message: "Unable to delete clan", statusCode: 400 };
        }
        return {
            success: true,
            message: "Clan deleted successfully",
            statusCode: 200,
            data: clan,
        };
    } catch (error) {
        logger.error("Error in deleteClanService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

// Adjust a clan's points by `delta` (may be negative), never below zero, and
// record the change in the point history attributed to the acting user.
export const manageClanPointsService = async (clanId, { delta, reason }, actor) => {
    try {
        // The total is read, clamped and written inside the DAL's transaction.
        // Computing it here would reintroduce the lost update this fixed.
        const applied = await applyClanPointsDal({
            clanId,
            delta,
            reason,
            createdByRef: actor?.referenceId ?? null,
            createdByName: actor?.displayName ?? null,
        });
        if (!applied) {
            return { success: false, message: "Clan not found", statusCode: 404 };
        }

        const updated = await getClanByIdDal(clanId);

        return {
            success: true,
            message: "Clan points updated successfully",
            statusCode: 200,
            data: updated,
        };
    } catch (error) {
        logger.error("Error in manageClanPointsService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};
