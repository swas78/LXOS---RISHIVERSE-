import type { LxMemberRole } from "@/features/lx/actor/types";

export type AccessHead = {
    id: string;
    /** Core `User.referenceId` — the canonical identifier. */
    referenceId: string;
    displayName: string | null;
    email: string | null;
};
export type AccessClub = { id: string; name: string; heads: AccessHead[] };
export type AccessClan = { id: string; name: string; color: string; heads: AccessHead[] };
export type AccessUser = {
    id: string;
    /** Core `User.referenceId` — enrollmentNo or employeeId. */
    referenceId: string;
    displayName: string | null;
    email: string | null;
    role: LxMemberRole;
    clubId: string | null;
    clanId: string | null;
};

export type AccessOverview = {
    clubs: AccessClub[];
    clans: AccessClan[];
    admins: AccessUser[];
    lxMembers: AccessUser[];
    financeMembers: AccessUser[];
    users: AccessUser[];
};

/**
 * Identify the person by `memberId` (an existing LxMember row) or by
 * `referenceId` (core identity — creates the LX overlay if it doesn't exist).
 * `email` is a dev-only fallback for the seeded stubs.
 */
export type AssignPayload = {
    memberId?: string;
    referenceId?: string;
    email?: string;
    displayName?: string;
    type: "admin" | "lx" | "finance" | "club" | "clan" | "guest";
    clubId?: string;
    clanId?: string;
};

export type RemovePayload = {
    memberId: string;
    type: "admin" | "lx" | "finance" | "club" | "clan";
};
