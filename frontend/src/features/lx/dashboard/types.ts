import type { LxEvent } from "@/features/lx/event/types";

export type DashboardStats = {
    stats: {
        totalEvents: number;
        activeClubs: number;
        clans: number;
        upcomingEvents: number;
    };
    nextUp: { event: LxEvent; daysAway: number } | null;
    recentEvents: LxEvent[];
    pendingApprovals: {
        events: number;
        achievements: number;
        reimbursements: number;
        expenses: number;
        total: number;
    };
};
