export type LxProductCategory =
    "WEBSITE" | "WEB_APP" | "MOBILE_APP" | "HARDWARE" | "DESIGN" | "RESEARCH" | "GAME" | "OTHER";

export type LxProductStatus = "PENDING" | "APPROVED" | "REJECTED";

export type LxProduct = {
    id: string;
    title: string;
    tagline: string;
    description: string;
    url: string | null;
    repoUrl: string | null;
    /** Durable `s3:<bucket>:<key>` pointers, in display order. `images[0]` is the cover. */
    images: string[];
    /**
     * Read-only, parallel to `images` — `imageUrls[i]` renders `images[i]`.
     * Short-lived signed URLs; never send these back to the API.
     */
    imageUrls?: (string | null)[];
    category: LxProductCategory;
    techStack: string[];
    tags: string[];
    clubId: string | null;
    clubName: string | null;
    featured: boolean;
    createdByRef: string;
    createdByName: string;
    teamMembers: string[];
    status: LxProductStatus;
    approvedByRef: string | null;
    approvedByName: string | null;
    approvedAt: string | null;
    rejectionReason: string | null;
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

export type LxProductListResponse = {
    success: boolean;
    message: string;
    data: LxProduct[];
    pagination: Pagination;
};

export type LxProductItemResponse = {
    success: boolean;
    message: string;
    data: LxProduct;
};

export type CreateLxProductPayload = {
    title: string;
    tagline?: string;
    description: string;
    url?: string | null;
    repoUrl?: string | null;
    images?: string[];
    category?: LxProductCategory;
    techStack?: string[];
    tags?: string[];
    teamMembers?: string[];
    clubId?: string | null;
    clubName?: string | null;
};

export type LxProductListParams = {
    search?: string;
    status?: string;
    category?: string;
    createdByRef?: string;
    page?: number;
    limit?: number;
    sortBy?: "title" | "createdAt" | "updatedAt" | "category" | "status";
    sortOrder?: "asc" | "desc";
};

export type ReviewProductPayload = {
    action: "approve" | "reject";
    rejectionReason?: string;
};
