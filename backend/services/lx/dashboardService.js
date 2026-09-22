import createContextLogger from "../../logger/contextLogger.js";
import { getDashboardDataDal } from "../../dals/lx/dashboardDal.js";
import { eventVisibilityScope } from "../../helper/lxScope.js";

const logger = createContextLogger("dashboardService");

export const getDashboardStatsService = async (actor) => {
    try {
        const d = await getDashboardDataDal(eventVisibilityScope(actor));
        let nextUpDaysAway = null;
        if (d.nextUp) {
            const diffMs = new Date(d.nextUp.startDate).getTime() - Date.now();
            nextUpDaysAway = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        }
        return {
            success: true,
            message: "Dashboard stats fetched successfully",
            statusCode: 200,
            data: {
                stats: {
                    totalEvents: d.totalEvents,
                    activeClubs: d.activeClubs,
                    clans: d.clansCount,
                    upcomingEvents: d.upcomingEvents,
                },
                nextUp: d.nextUp ? { event: d.nextUp, daysAway: nextUpDaysAway } : null,
                recentEvents: d.recentEvents,
                pendingApprovals: d.pending,
            },
        };
    } catch (error) {
        logger.error("Error in getDashboardStatsService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};
