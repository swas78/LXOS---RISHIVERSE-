import createContextLogger from "../../logger/contextLogger.js";
import prisma from "../../services/prismaClient.js";

const logger = createContextLogger("calendarDal");

// Approved/completed events for the shared calendar view.
export const getCalendarEventsDal = async ({ from, to, type } = {}) => {
    try {
        const where = {
            deletedAt: null,
            status: { in: ["APPROVED", "COMPLETED"] },
            ...(type ? { type } : {}),
            ...(from || to
                ? {
                      startDate: {
                          ...(from ? { gte: new Date(from) } : {}),
                          ...(to ? { lte: new Date(to) } : {}),
                      },
                  }
                : {}),
        };
        return await prisma.lxEvent.findMany({
            where,
            orderBy: { startDate: "asc" },
            select: {
                id: true,
                title: true,
                type: true,
                startDate: true,
                endDate: true,
                roomNames: true,
                location: true,
                clubName: true,
                clanName: true,
                budgetAllocated: true,
                status: true,
            },
        });
    } catch (error) {
        logger.error("Error in getCalendarEventsDal", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};
