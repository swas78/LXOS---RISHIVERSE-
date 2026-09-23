import createContextLogger from "../../logger/contextLogger.js";
import prisma from "../../services/prismaClient.js";
import { LX_ROOM_BOOKING_ACTIVE_STATUSES } from "../../constants/lxRoomBookingConstant.js";
import { LX_EVENT_ACTIVE_STATUSES } from "../../constants/lxEventConstant.js";

const logger = createContextLogger("roomAvailabilityDal");

// A room is occupied by TWO different things, and until now neither knew about
// the other:
//
//   - LxRoomBooking — someone booked the room directly.
//   - LxEvent.roomIds — an event was scheduled into the room.
//
// The booking conflict check only ever looked at other bookings, and the event
// conflict check only ever looked at other events. So a room held by an
// approved event still looked free to the booking flow, and vice versa. Any
// honest answer to "which rooms are free between X and Y" has to read both.
//
// Two ranges overlap when `existing.start < new.end AND existing.end > new.start`.

/**
 * Everything occupying any of `roomIds` during [startTime, endTime).
 *
 * @returns Map<roomId, Array<{ source, id, title, startTime, endTime }>>
 */
export const findRoomOccupancyDal = async ({
    roomIds,
    startTime,
    endTime,
    excludeBookingId,
    excludeEventId,
}) => {
    try {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const scoped = Array.isArray(roomIds) && roomIds.length > 0;

        const [bookings, events] = await Promise.all([
            prisma.lxRoomBooking.findMany({
                where: {
                    deletedAt: null,
                    status: { in: LX_ROOM_BOOKING_ACTIVE_STATUSES },
                    ...(scoped ? { roomId: { in: roomIds } } : {}),
                    ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
                    startTime: { lt: end },
                    endTime: { gt: start },
                },
                select: {
                    id: true,
                    roomId: true,
                    title: true,
                    startTime: true,
                    endTime: true,
                    status: true,
                },
                orderBy: { startTime: "asc" },
            }),
            prisma.lxEvent.findMany({
                where: {
                    deletedAt: null,
                    status: { in: LX_EVENT_ACTIVE_STATUSES },
                    ...(scoped ? { roomIds: { hasSome: roomIds } } : {}),
                    ...(excludeEventId ? { id: { not: excludeEventId } } : {}),
                    startDate: { lt: end },
                    endDate: { gt: start },
                },
                select: {
                    id: true,
                    roomIds: true,
                    title: true,
                    startDate: true,
                    endDate: true,
                    status: true,
                },
                orderBy: { startDate: "asc" },
            }),
        ]);

        const byRoom = new Map();
        const push = (roomId, entry) => {
            if (!roomId) return;
            if (!byRoom.has(roomId)) byRoom.set(roomId, []);
            byRoom.get(roomId).push(entry);
        };

        for (const b of bookings) {
            push(b.roomId, {
                source: "BOOKING",
                id: b.id,
                title: b.title,
                status: b.status,
                startTime: b.startTime,
                endTime: b.endTime,
            });
        }
        for (const e of events) {
            // An event can hold several rooms; it only conflicts with the ones
            // actually being asked about.
            const held = scoped ? e.roomIds.filter((id) => roomIds.includes(id)) : e.roomIds;
            for (const roomId of held) {
                push(roomId, {
                    source: "EVENT",
                    id: e.id,
                    title: e.title,
                    status: e.status,
                    startTime: e.startDate,
                    endTime: e.endDate,
                });
            }
        }

        return byRoom;
    } catch (error) {
        logger.error("Error in findRoomOccupancyDal", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

/** Bookable rooms matching the usual list filters, without pagination. */
export const findBookableRoomsDal = async ({ search, type }) => {
    try {
        return await prisma.lxRoom.findMany({
            where: {
                deletedAt: null,
                isActive: true,
                ...(Array.isArray(type) && type.length > 0 ? { type: { in: type } } : {}),
                ...(search
                    ? {
                          OR: [
                              { name: { contains: search, mode: "insensitive" } },
                              { building: { contains: search, mode: "insensitive" } },
                          ],
                      }
                    : {}),
            },
            orderBy: [{ building: "asc" }, { name: "asc" }],
        });
    } catch (error) {
        logger.error("Error in findBookableRoomsDal", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};
