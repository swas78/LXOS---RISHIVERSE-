export type LxInitiativeStatus = "PLANNING" | "ACTIVE" | "COMPLETED";

export type LxInitiativePriority = "LOW" | "MEDIUM" | "HIGH";

export type LxInitiative = {
    id: string;
    title: string;
    description: string;
    clanId: string;
    clanName: string | null;
    semester: string;
    status: LxInitiativeStatus;
    progress: number;
    priority: string;
    team: string[];
    date: string;
    createdByRef: string | null;
    createdByName: string | null;
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

export type LxInitiativeListResponse = {
    success: boolean;
    message: string;
    data: LxInitiative[];
    pagination: Pagination;
};

export type LxInitiativeItemResponse = {
    success: boolean;
    message: string;
    data: LxInitiative;
};

export type CreateLxInitiativePayload = {
    title: string;
    description?: string;
    clanId: string;
    clanName?: string | null;
    semester?: string;
    status?: LxInitiativeStatus;
    progress?: number;
    priority?: LxInitiativePriority;
    team?: string[];
};

export type UpdateLxInitiativePayload = Partial<CreateLxInitiativePayload>;

export type LxInitiativeListParams = {
    search?: string;
    clanId?: string;
    status?: LxInitiativeStatus;
    page?: number;
    limit?: number;
    sortBy?: "date" | "title" | "progress" | "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
};
