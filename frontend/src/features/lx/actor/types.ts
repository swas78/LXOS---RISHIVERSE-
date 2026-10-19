export type LxMemberRole =
    "ADMIN" | "LX_TEAM" | "CLUB_HEAD" | "CLAN_HEAD" | "FINANCE" | "LIBRARIAN" | "GUEST";

/**
 * The LX overlay on a core identity. Core owns the person; this row only
 * records what they may do inside LX.
 */
export type LxMember = {
    id: string;
    /** Core `User.referenceId` — enrollmentNo (student) or employeeId (employee). */
    referenceId: string;
    role: LxMemberRole;
    clubId: string | null;
    clanId: string | null;
    isActive: boolean;
    /** DEV-SHIM ONLY — production resolves names from core User/Student/Employee. */
    displayName: string | null;
    /** DEV-SHIM ONLY — core owns email. */
    email: string | null;
    /** DEV-SHIM ONLY — core serves `userProfileImg`. */
    avatar: string | null;
};

/** The acting user, as resolved by the backend's actor middleware. */
export type LxActor = {
    /** Core `User.referenceId`. The identity key behind every LX write. */
    referenceId: string;
    role: LxMemberRole;
    clubId: string | null;
    clanId: string | null;
    permissions?: string[];
    /** Filled by real auth in production; null under the kit's dev shim. */
    coreUserId: number | null;
    coreRole: string | null;
    /** DEV-SHIM ONLY. */
    displayName: string | null;
};

export const ROLE_LABELS: Record<LxMemberRole, string> = {
    ADMIN: "Admin",
    LX_TEAM: "LX Team",
    CLUB_HEAD: "Club Head",
    CLAN_HEAD: "Clan Head",
    FINANCE: "Finance",
    LIBRARIAN: "Librarian",
    GUEST: "General Access",
};
