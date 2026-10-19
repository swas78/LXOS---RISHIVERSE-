export type LxClubCategory = "TECHNICAL" | "CULTURAL" | "SPORTS" | "SOCIAL" | "ACADEMIC" | "OTHER";

export type LxClub = {
    id: string;
    name: string;
    description: string;
    logo: string | null;
    category: LxClubCategory;
    /**
     * Budget columns are SCOPED by the backend (helper/lxScope.js): only finance
     * roles and this entity's own head may read them. Everyone else receives
     * `null` with `budgetVisible: false`.
     *
     * `null` means "you may not see this" — it is NOT zero. Render an em dash,
     * never ₹0, or the UI states a spending figure that is not true.
     */
    budgetAllocated: number | null;
    budgetSpent: number | null;
    budgetVisible: boolean;
    semester: string;
    budgetHistory: unknown[] | null;
    headName: string | null;
    headEmail: string | null;
    isActive: boolean;
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

export type LxClubListResponse = {
    success: boolean;
    message: string;
    data: LxClub[];
    pagination: Pagination;
};

export type LxClubItemResponse = {
    success: boolean;
    message: string;
    data: LxClub;
};

export type CreateLxClubPayload = {
    name: string;
    description: string;
    logo?: string | null;
    category?: LxClubCategory;
    budgetAllocated?: number;
    budgetSpent?: number;
    semester?: string;
    headName?: string | null;
    headEmail?: string | null;
    isActive?: boolean;
};

export type UpdateLxClubPayload = Partial<CreateLxClubPayload>;

export type LxClubListParams = {
    search?: string;
    category?: LxClubCategory;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: "name" | "category" | "budgetAllocated" | "budgetSpent" | "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
};
