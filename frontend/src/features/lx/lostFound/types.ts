// Lost & Found — a campus noticeboard behind an approval gate.
//
// Nothing here is public until an admin approves it, so the server decides what
// a given reader sees. The client renders `status` but never relies on it for
// access: a pending item simply is not in the response.

export type LxLostFoundKind = "LOST" | "FOUND";

export type LxLostFoundStatus = "PENDING" | "APPROVED" | "REJECTED" | "RESOLVED";

export type LxLostFoundCategory =
    | "ELECTRONICS"
    | "ID_CARD"
    | "KEYS"
    | "WALLET"
    | "CLOTHING"
    | "BOOK"
    | "STATIONERY"
    | "ACCESSORY"
    | "OTHER";

/** Which slice of the board is being read. */
export type LxLostFoundScope = "BOARD" | "PENDING" | "MINE" | "RESOLVED";

export type LxLostFoundItem = {
    id: string;
    kind: LxLostFoundKind;
    title: string;
    description: string;
    category: LxLostFoundCategory;
    /** Core S3 pointers; `images[0]` is the card thumbnail. */
    images: string[];
    location: string;
    occurredOn: string;
    /** Published only on an approved item, and to its author / reviewers. */
    contactPhone: string | null;
    reportedByRef: string;
    reportedByName: string | null;
    status: LxLostFoundStatus;
    approvedByName: string | null;
    approvedAt: string | null;
    /** Feedback for the author — null for everyone else. */
    rejectionReason: string | null;
    resolvedAt: string | null;
    resolutionNote: string | null;
    createdAt: string;
    updatedAt: string;
    // Server-computed affordances, so the UI never re-derives permission rules.
    isMine: boolean;
    canEdit: boolean;
    canResolve: boolean;
};

export type CreateLxLostFoundPayload = {
    kind: LxLostFoundKind;
    title: string;
    description: string;
    category: LxLostFoundCategory;
    images: string[];
    location: string;
    occurredOn: string;
    contactPhone?: string | null;
};

export type LxLostFoundCounts = {
    APPROVED: number;
    PENDING: number;
    RESOLVED: number;
    canReview: boolean;
};

export type LxLostFoundListResponse = {
    success: boolean;
    message: string;
    data: LxLostFoundItem[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
    };
    meta: { counts: LxLostFoundCounts };
};

export type LxLostFoundListParams = {
    scope?: LxLostFoundScope;
    search?: string;
    kind?: LxLostFoundKind;
    category?: LxLostFoundCategory;
    page?: number;
    limit?: number;
};
