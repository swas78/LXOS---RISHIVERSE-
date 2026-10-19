export type BudgetClubRow = {
    id: string;
    name: string;
    category: string;
    budgetAllocated: number;
    budgetSpent: number;
    budgetRemaining: number;
    utilization: number;
};

export type BudgetClanRow = {
    id: string;
    name: string;
    color: string;
    budgetAllocated: number;
    budgetSpent: number;
    points: number;
    budgetRemaining: number;
    utilization: number;
};

export type BudgetSummary = {
    totals: {
        totalAllocated: number;
        totalSpent: number;
        totalRemaining: number;
        approvedExpenses: number;
        approvedExpenseCount: number;
        processedReimbursements: number;
        processedReimbursementCount: number;
        utilization: number;
    };
    clubs: BudgetClubRow[];
    clans: BudgetClanRow[];
    /** True when the backend scoped this to the actor's own club/clan. */
    scoped?: boolean;
    scopeRole?: string | null;
};
