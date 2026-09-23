import createContextLogger from "../../logger/contextLogger.js";
import {
    createRoomBookingDal,
    deleteRoomBookingDal,
    findConflictingBookingsDal,
    getAllRoomBookingsDal,
    getRoomBookingByIdDal,
    updateRoomBookingDal,
} from "../../dals/lx/roomBookingDal.js";
import { findBookableRoomsDal, findRoomOccupancyDal } from "../../dals/lx/roomAvailabilityDal.js";
import { createRoomBookingsAtomicDal, getRoomsByIdsDal } from "../../dals/lx/roomBookingDal.js";

const logger = createContextLogger("roomBookingService");

export const checkRoomAvailabilityService = async ({
    roomId,
    startTime,
    endTime,
    excludeBookingId,
}) => {
    try {
        const conflicts = await findConflictingBookingsDal({
            roomId,
            startTime,
            endTime,
            excludeBookingId,
        });
        return {
            success: true,
            message: conflicts.length === 0 ? "Room is available" : "Room is not available",
            statusCode: 200,
            data: { available: conflicts.length === 0, conflicts },
        };
    } catch (error) {
        logger.error("Error in checkRoomAvailabilityService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const createRoomBookingService = async (payload, actor) => {
    try {
        // The overlap check lives inside the DAL's Serializable transaction.
        // Checking here first would reopen the race it closes.
        const result = await createRoomBookingDal({
            roomId: payload.roomId,
            roomName: payload.roomName ?? null,
            eventId: payload.eventId ?? null,
            eventTitle: payload.eventTitle ?? null,
            title: payload.title,
            purpose: payload.purpose ?? "",
            startTime: payload.startTime,
            endTime: payload.endTime,
            requestedByRef: actor?.referenceId ?? "unknown",
            requestedByName: actor?.displayName ?? null,
        });

        if (result.conflicts) {
            return {
                success: false,
                message: "Room is not available for the selected time",
                statusCode: 409,
                conflicts: result.conflicts,
            };
        }

        return {
            success: true,
            message: "Room booking requested successfully",
            statusCode: 201,
            data: result.booking,
        };
    } catch (error) {
        logger.error("Error in createRoomBookingService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const getRoomBookingByIdService = async (bookingId) => {
    try {
        const booking = await getRoomBookingByIdDal(bookingId);
        if (!booking) {
            return { success: false, message: "Booking not found", statusCode: 404 };
        }
        return { success: true, message: "Booking found", statusCode: 200, data: booking };
    } catch (error) {
        logger.error("Error in getRoomBookingByIdService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const getAllRoomBookingsService = async (query) => {
    try {
        const result = await getAllRoomBookingsDal(query);
        return {
            success: true,
            message: "Bookings fetched successfully",
            statusCode: 200,
            data: result.data,
            pagination: {
                page: result.page,
                limit: result.limit,
                totalCount: result.totalCount,
                totalPages: result.totalPages,
            },
        };
    } catch (error) {
        logger.error("Error in getAllRoomBookingsService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const reviewRoomBookingService = async (bookingId, { action, rejectionReason }, actor) => {
    try {
        const existing = await getRoomBookingByIdDal(bookingId);
        if (!existing) {
            return { success: false, message: "Booking not found", statusCode: 404 };
        }
        if (action === "approve") {
            // Re-check conflicts against other APPROVED/PENDING bookings before approving.
            const conflicts = await findConflictingBookingsDal({
                roomId: existing.roomId,
                startTime: existing.startTime,
                endTime: existing.endTime,
                excludeBookingId: existing.id,
            });
            if (conflicts.some((c) => c.status === "APPROVED")) {
                return {
                    success: false,
                    message: "Cannot approve — the room is already booked for this time",
                    statusCode: 409,
                    conflicts,
                };
            }
        }
        const data =
            action === "approve"
                ? {
                      status: "APPROVED",
                      approvedByRef: actor?.referenceId ?? null,
                      approvedByName: actor?.displayName ?? null,
                      approvedAt: new Date(),
                      rejectionReason: null,
                  }
                : { status: "REJECTED", rejectionReason: rejectionReason || "Rejected" };
        const booking = await updateRoomBookingDal(bookingId, data);
        return {
            success: true,
            message: `Booking ${action}d successfully`,
            statusCode: 200,
            data: booking,
        };
    } catch (error) {
        logger.error("Error in reviewRoomBookingService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const cancelRoomBookingService = async (bookingId) => {
    try {
        const existing = await getRoomBookingByIdDal(bookingId);
        if (!existing) {
            return { success: false, message: "Booking not found", statusCode: 404 };
        }
        const booking = await updateRoomBookingDal(bookingId, { status: "CANCELLED" });
        return { success: true, message: "Booking cancelled", statusCode: 200, data: booking };
    } catch (error) {
        logger.error("Error in cancelRoomBookingService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const deleteRoomBookingService = async (bookingId) => {
    try {
        const existing = await getRoomBookingByIdDal(bookingId);
        if (!existing) {
            return { success: false, message: "Booking not found", statusCode: 404 };
        }
        const booking = await deleteRoomBookingDal(bookingId);
        return { success: true, message: "Booking deleted", statusCode: 200, data: booking };
    } catch (error) {
        logger.error("Error in deleteRoomBookingService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

// ---------------------------------------------------------------------------
// Availability-first booking.
//
// The old flow was "pick a room, then discover it is taken". These two power
// the reverse: say when you need a space, see only what is actually free, and
// claim one or several in a single request.
//
// "Free" means free of BOTH an overlapping room booking and an overlapping
// event. Those two were previously blind to each other, so a room held by an
// approved event still advertised itself as bookable.
// ---------------------------------------------------------------------------

/** Every bookable room for a time window, each marked available or not. */
export const getRoomAvailabilityService = async ({ startTime, endTime, search, type }) => {
    try {
        const start = new Date(startTime);
        const end = new Date(endTime);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return { success: false, message: "Invalid start or end time", statusCode: 400 };
        }
        if (end <= start) {
            return {
                success: false,
                message: "End time must be after start time",
                statusCode: 400,
            };
        }

        const rooms = await findBookableRoomsDal({ search, type });
        const occupancy = await findRoomOccupancyDal({
            roomIds: rooms.map((r) => r.id),
            startTime: start,
            endTime: end,
        });

        const data = rooms.map((room) => {
            const conflicts = occupancy.get(room.id) ?? [];
            return { ...room, available: conflicts.length === 0, conflicts };
        });

        const availableCount = data.filter((r) => r.available).length;
        return {
            success: true,
            message: `${availableCount} of ${data.length} rooms are free for that window`,
            statusCode: 200,
            data,
            meta: { startTime: start, endTime: end, total: data.length, availableCount },
        };
    } catch (error) {
        logger.error("Error in getRoomAvailabilityService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

/**
 * Book several rooms for one purpose, all or nothing.
 *
 * All-or-nothing is deliberate: someone booking three rooms for one session
 * does not want two of them. If any room is taken between choosing and
 * submitting, the whole request comes back 409 naming the rooms that went, and
 * nothing is created.
 */
export const createRoomBookingsService = async (payload, actor) => {
    const { roomIds, title, purpose, startTime, endTime, eventId, eventTitle } = payload;
    try {
        const start = new Date(startTime);
        const end = new Date(endTime);
        if (end <= start) {
            return {
                success: false,
                message: "End time must be after start time",
                statusCode: 400,
            };
        }

        const rooms = await getRoomsByIdsDal(roomIds);
        if (rooms.length !== roomIds.length) {
            return {
                success: false,
                message: "One or more rooms no longer exist",
                statusCode: 404,
            };
        }

        const result = await createRoomBookingsAtomicDal({
            rooms,
            title,
            purpose: purpose ?? "",
            startTime: start,
            endTime: end,
            eventId: eventId ?? null,
            eventTitle: eventTitle ?? null,
            requestedByRef: actor?.referenceId ?? "unknown",
            requestedByName: actor?.displayName ?? null,
        });

        if (result.unavailable) {
            return {
                success: false,
                message:
                    result.unavailable.length === 1
                        ? `${result.unavailable[0].roomName} was taken while you were choosing`
                        : `${result.unavailable.length} rooms were taken while you were choosing`,
                statusCode: 409,
                unavailable: result.unavailable,
            };
        }

        return {
            success: true,
            message:
                result.bookings.length === 1
                    ? "Booking requested — an admin will approve it"
                    : `${result.bookings.length} bookings requested — an admin will approve them`,
            statusCode: 201,
            data: result.bookings,
        };
    } catch (error) {
        logger.error("Error in createRoomBookingsService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};
