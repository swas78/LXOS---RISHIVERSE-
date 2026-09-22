import createContextLogger from "../../logger/contextLogger.js";
import prisma from "../../services/prismaClient.js";
import { buildPagination, normalizeSortOrder, pageSkip } from "../../helper/lxHelper.js";
import { LX_ROOM_BOOKING_ACTIVE_STATUSES } from "../../constants/lxRoomBookingConstant.js";

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

export const createRoomBookingDal = async (payload) => {
    try {
        return await prisma.lxRoomBooking.create({ data: payload });
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
