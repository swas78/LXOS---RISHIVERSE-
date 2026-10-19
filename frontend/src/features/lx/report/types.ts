export type ReportMetric = { metric: string; value: number };
export type ReportBudgetRow = {
    name: string;
    allocated: number;
    used: number;
    remaining: number;
    points?: number;
};
export type ReportEvent = {
    title: string;
    type: string;
    org: string;
    start: string;
    end: string;
    status: string;
    venue: string;
    allocated: number;
    spent: number;
    completed: string;
};
export type ReportAchievement = {
    title: string;
    category: string;
    org: string;
    points: number;
    status: string;
    date: string;
    participants: string;
    addedBy: string;
};
export type ReportReimbursement = {
    title: string;
    by: string;
    amount: number;
    category: string;
    chargedTo: string;
    purpose: string;
    status: string;
    date: string;
};
export type ReportInitiative = {
    title: string;
    clan: string;
    semester: string;
    status: string;
    date: string;
    description: string;
};
export type ReportPointTxn = {
    clan: string;
    delta: number;
    points: number;
    reason: string;
    date: string;
};

export type LxReport = {
    semester: string;
    generatedAt: string;
    summary: ReportMetric[];
    clubBudgets: ReportBudgetRow[];
    clanBudgets: ReportBudgetRow[];
    events: ReportEvent[];
    achievements: ReportAchievement[];
    reimbursements: ReportReimbursement[];
    initiatives: ReportInitiative[];
    pointHistory: ReportPointTxn[];
};

export type RolloverPayload = { newSemester: string; resetAllocation: boolean };
