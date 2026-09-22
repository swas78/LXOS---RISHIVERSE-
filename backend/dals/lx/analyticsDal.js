import createContextLogger from "../../logger/contextLogger.js";
import prisma from "../../services/prismaClient.js";

const logger = createContextLogger("analyticsDal");

export const getAnalyticsDataDal = async () => {
    try {
        const [events, clubs, clans, achievementsCount, expenseAgg] = await Promise.all([
            prisma.lxEvent.findMany({
                where: { deletedAt: null },
                select: {
                    id: true,
                    type: true,
                    clubId: true,
                    clubName: true,
                    budgetAllocated: true,
                    budgetSpent: true,
                },
            }),
            prisma.lxClub.findMany({
                where: { deletedAt: null },
                select: { id: true, name: true, budgetAllocated: true, budgetSpent: true },
            }),
            prisma.lxClan.findMany({
                where: { deletedAt: null },
                select: { id: true, name: true, color: true, points: true },
                orderBy: { points: "desc" },
            }),
            prisma.lxAchievement.count({ where: { deletedAt: null, status: "APPROVED" } }),
            prisma.lxExpense.aggregate({
                where: { deletedAt: null, status: "APPROVED" },
                _sum: { amount: true },
            }),
        ]);
        return { events, clubs, clans, achievementsCount, expenseAgg };
    } catch (error) {
        logger.error("Error in getAnalyticsDataDal", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};
