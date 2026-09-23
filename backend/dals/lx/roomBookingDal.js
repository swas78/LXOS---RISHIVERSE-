import createContextLogger from "../../logger/contextLogger.js";
import prisma from "../../services/prismaClient.js";
import { buildPagination, normalizeSortOrder, pageSkip } from "../../helper/lxHelper.js";
import { LX_ROOM_BOOKING_ACTIVE_STATUSES } from "../../constants/lxRoomBookingConstant.js";
import { withSerializableRetry } from "./serializableRetry.js";

const logger = createContextLogger("roomBookingDal");

// Overlapping active bookings for a room. Two ranges overlap when
// existing.startTime < new.endTime AND existing.endTime > new.startTime.
export const findConflictingBookingsDal = async ({
    roomId,
    startTime,
    endTime,
    excludeBookingId,
}) => {
    try {
        return await prisma.lxRoomBooking.findMany({
            where: {
                deletedAt: null,
                roomId,
                status: { in: LX_ROOM_BOOKING_ACTIVE_STATUSES },
                ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
                startTime: { lt: new Date(endTime) },
                endTime: { gt: new Date(startTime) },
            },
            orderBy: { startTime: "asc" },
        });
    } catch (error) {
        logger.error("Error in findConflictingBookingsDal", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

// Claim a slot: re-check for an overlapping booking and insert, in ONE
// Serializable transaction.
//
// The check used to live in the service as a separate query, with the insert
// after it and nothing joining the two. Two people booking the same room in the
// same moment both read "no conflict" and both inserted — the double-booking
// this was supposed to prevent. Serializable makes Postgres detect the
// read-write conflict and abort the loser, which `withSerializableRetry` then
// retries; on retry the conflict is visible and the caller gets a clean 409.
//
// This is still application-level. A `btree_gist` exclusion constraint on
// (room_id, tstzrange(start_time, end_time)) is the database-level guarantee,
// and it remains a maintainer migration this module cannot ship. The difference
// is that the window is now a detected conflict rather than an open race.
//
// Returns { booking } on success, or { conflicts } if the slot is taken.
export const createRoomBookingDal = async (payload) => {
    try {
        return await withSerializableRetry(() =>
            prisma.$transaction(
                async (tx) => {
                    const conflicts = await tx.lxRoomBooking.findMany({
                        where: {
                            deletedAt: null,
                            roomId: payload.roomId,
                            status: { in: LX_ROOM_BOOKING_ACTIVE_STATUSES },
                            startTime: { lt: new Date(payload.endTime) },
                            endTime: { gt: new Date(payload.startTime) },
                        },
                        orderBy: { startTime: "asc" },
                    });
                    if (conflicts.length > 0) return { conflicts };

                    const booking = await tx.lxRoomBooking.create({ data: payload });
                    return { booking };
                },
                { isolationLevel: "Serializable" },
            ),
        );
    } catch (error) {
        logger.error("Error in createRoomBookingDal", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const getRoomBookingByIdDal = async (bookingId) => {
    try {
        return await prisma.lxRoomBooking.findFirst({ where: { id: bookingId, deletedAt: null } });
    } catch (error) {
        logger.error("Error in getRoomBookingByIdDal", {
            error: { message: error.message, stack: error.stack },
            bookingId,
        });
        throw error;
    }
};

export const getAllRoomBookingsDal = async ({
    roomId,
    eventId,
    status,
    from,
    to,
    page,
    limit,
    sortBy,
    sortOrder,
}) => {
    try {
        const where = {
            deletedAt: null,
            ...(roomId ? { roomId } : {}),
            ...(eventId ? { eventId } : {}),
            ...(Array.isArray(status) && status.length > 0 ? { status: { in: status } } : {}),
            ...(from || to
                ? {
                      startTime: {
                          ...(from ? { gte: new Date(from) } : {}),
                          ...(to ? { lte: new Date(to) } : {}),
                      },
                  }
                : {}),
        };

        const skip = pageSkip(page, limit);
        const [bookings, total] = await Promise.all([
            prisma.lxRoomBooking.findMany({
                where,
                orderBy: { [sortBy]: normalizeSortOrder(sortOrder, "asc") },
                skip,
                take: limit,
            }),
            prisma.lxRoomBooking.count({ where }),
        ]);

        return { data: bookings, ...buildPagination(page, limit, total) };
    } catch (error) {
        logger.error("Error in getAllRoomBookingsDal", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const updateRoomBookingDal = async (bookingId, data) => {
    try {
        return await prisma.lxRoomBooking.update({ where: { id: bookingId }, data });
    } catch (error) {
        logger.error("Error in updateRoomBookingDal", {
            error: { message: error.message, stack: error.stack },
            bookingId,
        });
        throw error;
    }
};

export const deleteRoomBookingDal = async (bookingId) => {
    try {
        return await prisma.lxRoomBooking.update({
            where: { id: bookingId },
            data: { deletedAt: new Date() },
        });
    } catch (error) {
        logger.error("Error in deleteRoomBookingDal", {
            error: { message: error.message, stack: error.stack },
            bookingId,
        });
        throw error;
    }
};
