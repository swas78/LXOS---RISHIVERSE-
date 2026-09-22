// ---------------------------------------------------------------------------
// Library study cabins — librarian-only management: the cabin inventory and
// the block list. Every route into this file is gated on
// MANAGE_LIBRARY_CABINS (ADMIN or LIBRARIAN).
// ---------------------------------------------------------------------------
import createContextLogger from "../../logger/contextLogger.js";
import {
    countLiveBookingsForCabinDal,
    createBlockDal,
    createCabinDal,
    getBlockByIdDal,
    getCabinByIdDal,
    getAllCabinsDal,
    getMemberByRefDal,
    liftBlockDal,
    listActiveBlocksDal,
    softDeleteCabinDal,
    updateCabinDal,
} from "../../dals/lx/cabinDal.js";
import { serializeBlock, serializeCabin } from "./cabinService.js";

const logger = createContextLogger("cabinAdminService");

const ok = (message, data, statusCode = 200) => ({ success: true, message, statusCode, data });
const fail = (message, statusCode) => ({ success: false, message, statusCode });

// ---- Cabins ---------------------------------------------------------------

export const listCabinsService = async () => {
    try {
        const cabins = await getAllCabinsDal();
        return ok("Cabins fetched successfully", cabins.map(serializeCabin));
    } catch (error) {
        logger.error("Error in listCabinsService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const createCabinService = async (payload) => {
    try {
        const cabin = await createCabinDal(payload);
        return ok("Cabin created", serializeCabin(cabin), 201);
    } catch (error) {
        if (error?.code === "P2002") {
            return fail("A cabin with that name or code already exists.", 409);
        }
        logger.error("Error in createCabinService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const updateCabinService = async (cabinId, payload) => {
    try {
        const existing = await getCabinByIdDal(cabinId);
        if (!existing) return fail("Cabin not found", 404);

        // Capacity is validated against whichever half is not being changed, so a
        // single-field edit cannot leave an impossible range behind.
        const minCapacity = payload.minCapacity ?? existing.minCapacity;
        const maxCapacity = payload.maxCapacity ?? existing.maxCapacity;
        if (maxCapacity < minCapacity) {
            return fail("maxCapacity must be at least minCapacity", 400);
        }

        const data = { ...payload };
        // Taking a cabin out of service always carries a reason students can read;
        // putting it back always clears the old one.
        if (payload.isActive === true) {
            data.unavailableReason = null;
        } else if (payload.isActive === false) {
            data.unavailableReason = payload.unavailableReason || "Temporarily out of service";
        }

        const cabin = await updateCabinDal(cabinId, data);
        return ok("Cabin updated", serializeCabin(cabin));
    } catch (error) {
        if (error?.code === "P2002") {
            return fail("A cabin with that name or code already exists.", 409);
        }
        logger.error("Error in updateCabinService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const removeCabinService = async (cabinId) => {
    try {
        const cabin = await getCabinByIdDal(cabinId);
        if (!cabin) return fail("Cabin not found", 404);

        // Removing a cabin someone is sitting in would strand them. Taking it out
        // of service is the correct action and the message says so.
        const live = await countLiveBookingsForCabinDal(cabinId);
        if (live > 0) {
            return fail("This cabin has live bookings. Take it out of service instead.", 409);
        }

        const removed = await softDeleteCabinDal(cabinId);
        return ok("Cabin removed", serializeCabin(removed));
    } catch (error) {
        logger.error("Error in removeCabinService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

// ---- Blocks ---------------------------------------------------------------

export const listBlocksService = async () => {
    try {
        const blocks = await listActiveBlocksDal();
        return ok("Blocks fetched successfully", blocks.map(serializeBlock));
    } catch (error) {
        logger.error("Error in listBlocksService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const createBlockService = async (payload, actor) => {
    try {
        const member = await getMemberByRefDal(payload.memberRef);
        if (!member) return fail("That person is not in the university directory.", 404);

        const block = await createBlockDal({
            memberRef: payload.memberRef,
            memberName: member.displayName ?? null,
            reason: payload.reason ?? "MANUAL",
            note: payload.note ?? null,
            startsAt: new Date(),
            // No day count means a permanent block, liftable only at the desk.
            expiresAt:
                Number.isFinite(payload.days) && payload.days > 0
                    ? new Date(Date.now() + payload.days * 24 * 60 * 60 * 1000)
                    : null,
            createdByRef: actor?.referenceId ?? null,
        });

        return ok("Block applied", serializeBlock(block), 201);
    } catch (error) {
        logger.error("Error in createBlockService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const liftBlockService = async (blockId, payload, actor) => {
    try {
        const existing = await getBlockByIdDal(blockId);
        if (!existing) return fail("Block not found", 404);
        if (existing.liftedAt) return fail("That block has already been lifted.", 409);

        const block = await liftBlockDal(blockId, {
            liftedByRef: actor?.referenceId ?? null,
            liftReason: payload?.reason ?? null,
        });
        return ok("Block lifted", serializeBlock(block));
    } catch (error) {
        logger.error("Error in liftBlockService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};
