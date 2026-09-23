import createContextLogger from "../../logger/contextLogger.js";
import { sumMoney, toMoney } from "../../helper/lxMoney.js";
import { getAnalyticsDataDal } from "../../dals/lx/analyticsDal.js";

const logger = createContextLogger("analyticsService");

export const getAnalyticsService = async () => {
    try {
        const { events, clubs, clans, achievementsCount, expenseAgg } = await getAnalyticsDataDal();

        // Club activity: events organised per club.
        const clubEventCounts = {};
        for (const e of events) {
            if (e.clubName) clubEventCounts[e.clubName] = (clubEventCounts[e.clubName] || 0) + 1;
        }
        const clubActivity = Object.entries(clubEventCounts)
            .map(([name, count]) => ({ name, events: count }))
            .sort((a, b) => b.events - a.events);

        // Events by type (donut).
        const typeCounts = {};
        for (const e of events) typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
        const eventsByType = Object.entries(typeCounts).map(([type, count]) => ({
            type,
            count,
        }));

        // Budget vs spending per club.
        const budgetVsSpending = clubs.map((c) => ({
            name: c.name,
            allocated: toMoney(c.budgetAllocated),
            spent: toMoney(c.budgetSpent),
        }));

        // Clan performance (points).
        const clanPerformance = clans.map((c) => ({
            name: c.name,
            color: c.color,
            points: c.points,
        }));

        const totalBudgetAllocated = sumMoney(clubs.map((c) => c.budgetAllocated));

        return {
            success: true,
            message: "Analytics fetched successfully",
            statusCode: 200,
            data: {
                clubActivity,
                eventsByType,
                budgetVsSpending,
                clanPerformance,
                stats: {
                    totalEvents: events.length,
                    budgetAllocated: totalBudgetAllocated,
                    expenses: toMoney(expenseAgg._sum.amount),
                    achievements: achievementsCount,
                },
            },
        };
    } catch (error) {
        logger.error("Error in getAnalyticsService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};
