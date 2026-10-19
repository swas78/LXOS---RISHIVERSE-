// Append-only clan point ledger entry (backend: LxClanPointTxn).
export type LxClanPointTxn = {
    id: string;
    clanId: string;
    delta: number;
    points: number;
    previousPoints: number;
    reason: string;
    eventId: string | null;
    createdByRef: string | null;
    createdByName: string | null;
    date: string;
    createdAt: string;
};

export type LxClan = {
    id: string;
    name: string;
    color: string;
    points: number;
    /**
     * SCOPED by the backend — `null` when this actor may not read the figure
     * (helper/lxScope.js). `null` is "hidden", not zero: render an em dash.
     */
    budgetAllocated: number | null;
    budgetSpent: number | null;
    budgetVisible: boolean;
    semester: string;
    budgetHistory: unknown[];
    description: string;
    pointTxns?: LxClanPointTxn[];
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export type Pagination = {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
};

export type LxClanListResponse = {
    success: boolean;
    message: string;
    data: LxClan[];
    pagination: Pagination;
};

export type LxClanItemResponse = {
    success: boolean;
    message: string;
    data: LxClan;
};

export type CreateLxClanPayload = {
    name: string;
    color: string;
    points?: number;
    budgetAllocated?: number;
    budgetSpent?: number;
    semester?: string;
    description?: string;
};

export type UpdateLxClanPayload = Partial<CreateLxClanPayload>;

export type ManageClanPointsPayload = {
    delta: number;
    reason: string;
};

export type LxClanListParams = {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: "points" | "name" | "budgetAllocated" | "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
};
