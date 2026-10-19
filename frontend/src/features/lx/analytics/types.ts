export type AnalyticsData = {
    clubActivity: { name: string; events: number }[];
    eventsByType: { type: string; count: number }[];
    budgetVsSpending: { name: string; allocated: number; spent: number }[];
    clanPerformance: { name: string; color: string; points: number }[];
    stats: {
        totalEvents: number;
        budgetAllocated: number;
        expenses: number;
        achievements: number;
    };
};
