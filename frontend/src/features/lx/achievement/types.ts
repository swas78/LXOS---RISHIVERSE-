export type LxAchievementCategory =
    "ACADEMIC" | "SPORTS" | "CULTURAL" | "TECHNICAL" | "SOCIAL" | "OTHER";

export type LxAchievementKind = "ACHIEVEMENT" | "UPDATE";

export type LxAchievementStatus = "PENDING" | "APPROVED" | "REJECTED";

export type LxAchievement = {
    id: string;
    title: string;
    description: string;
    eventId: string | null;
    clubId: string | null;
    clubName: string | null;
    clanId: string | null;
    clanName: string | null;
    points: number;
    achievedDate: string;
    semester: string;
    category: LxAchievementCategory;
    kind: LxAchievementKind;
    participants: string[];
    images: string[];
    createdByRef: string;
    createdByName: string;
    status: LxAchievementStatus;
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

export type LxAchievementListResponse = {
    success: boolean;
    message: string;
    data: LxAchievement[];
    pagination: Pagination;
};

export type LxAchievementItemResponse = {
    success: boolean;
    message: string;
    data: LxAchievement;
};

export type CreateLxAchievementPayload = {
    title: string;
    description: string;
    eventId?: string | null;
    clubId?: string | null;
    clubName?: string | null;
    clanId?: string | null;
    clanName?: string | null;
    points?: number;
    achievedDate?: string;
    semester?: string;
    category?: LxAchievementCategory;
    kind?: LxAchievementKind;
    participants?: string[];
    images?: string[];
};

export type LxAchievementListParams = {
    search?: string;
    person?: string;
    clubId?: string;
    clanId?: string;
    kind?: LxAchievementKind;
    category?: LxAchievementCategory | string;
    status?: LxAchievementStatus | string;
    page?: number;
    limit?: number;
    sortBy?: "achievedDate" | "title" | "createdAt" | "points";
    sortOrder?: "asc" | "desc";
};

export type ReviewLxAchievementPayload = {
    action: "approve" | "reject";
    rejectionReason?: string;
};

// Minimal shapes for the club/clan link selects on the Add form.
export type LxClubLite = { id: string; name: string };
export type LxClanLite = { id: string; name: string };

export type LxMemberRole =
    "ADMIN" | "LX_TEAM" | "CLUB_HEAD" | "CLAN_HEAD" | "FINANCE" | "LIBRARIAN" | "GUEST";

// The acting user (dev actor shim on the backend supplies this via /lx/user/me).
export type LxActor = {
    id: string;
    name: string;
    email: string;
    role: LxMemberRole;
    clubId: string | null;
    clanId: string | null;
};
