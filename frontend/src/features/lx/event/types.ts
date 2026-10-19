export type LxEventType = "CLUB" | "CLAN" | "LX" | "FEST";

export type LxEventStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED";

export type LxEventRequirement = {
    item: string;
    quantity?: number;
    estimatedCost?: number;
};

export type LxEvent = {
    id: string;
    title: string;
    description: string;
    type: LxEventType;
    clubId: string | null;
    clubName: string | null;
    clanId: string | null;
    clanName: string | null;
    startDate: string;
    endDate: string;
    roomIds: string[];
    roomNames: string[];
    location: string;
    requirements: LxEventRequirement[];
    /**
     * SCOPED by the backend — `null` when this actor may not read the figure
     * (helper/lxScope.js). `null` is "hidden", not zero: render an em dash.
     */
    budgetAllocated: number | null;
    budgetSpent: number | null;
    budgetVisible: boolean;
    status: LxEventStatus;
    createdByRef: string;
    createdByName: string;
    createdByRole: string | null;
    approvedByRef: string | null;
    approvedByName: string | null;
    approvedAt: string | null;
    rejectionReason: string | null;
    attendees: number;
    poster: string | null;
    clanScores: Record<string, unknown>;
    isCompleted: boolean;
    completedAt: string | null;
    completedByRef: string | null;
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

export type LxEventListResponse = {
    success: boolean;
    message: string;
    data: LxEvent[];
    pagination: Pagination;
};

export type LxEventItemResponse = {
    success: boolean;
    message: string;
    data: LxEvent;
};

export type CreateLxEventPayload = {
    title: string;
    description: string;
    type: LxEventType;
    clubId?: string | null;
    clubName?: string | null;
    clanId?: string | null;
    clanName?: string | null;
    startDate: string;
    endDate: string;
    roomIds?: string[];
    roomNames?: string[];
    location?: string;
    requirements?: LxEventRequirement[];
    budgetAllocated?: number;
    attendees?: number;
    poster?: string | null;
};

export type UpdateLxEventPayload = Partial<
    Omit<CreateLxEventPayload, "type"> & {
        type: LxEventType;
        budgetSpent: number;
    }
>;

export type LxEventListParams = {
    search?: string;
    type?: LxEventType | LxEventType[];
    status?: LxEventStatus | LxEventStatus[];
    clubId?: string;
    clanId?: string;
    page?: number;
    limit?: number;
    sortBy?: "startDate" | "title" | "status" | "createdAt";
    sortOrder?: "asc" | "desc";
};

export type AvailabilityPayload = {
    roomIds: string[];
    startDate: string;
    endDate: string;
    excludeEventId?: string;
};

export type AvailabilityResponse = {
    success: boolean;
    message: string;
    available: boolean;
    conflicts: LxEvent[];
};

export type ApproveEventPayload = {
    action: "approve" | "reject";
    rejectionReason?: string;
};
