// Frontend mirror of the backend RBAC (helper/lxPermissions.js). Used to GATE
// UI — hide nav items and actions a role can't use. The backend is the real
// enforcement point; this is UX. The acting user's permission list comes from
// GET /lx/user/me and lives on the actor slice.

import type { LxMemberRole } from "@/features/lx/actor/types";

export const PERMISSIONS = {
    CREATE_EVENT: "CREATE_EVENT",
    EDIT_EVENT: "EDIT_EVENT",
    DELETE_EVENT: "DELETE_EVENT",
    APPROVE_EVENT: "APPROVE_EVENT",
    VIEW_ALL_EVENTS: "VIEW_ALL_EVENTS",
    BOOK_ROOM: "BOOK_ROOM",
    APPROVE_BOOKING: "APPROVE_BOOKING",
    MANAGE_ROOMS: "MANAGE_ROOMS",
    REPORT_LOST_FOUND: "REPORT_LOST_FOUND",
    APPROVE_LOST_FOUND: "APPROVE_LOST_FOUND",
    BOOK_CABIN: "BOOK_CABIN",
    MANAGE_LIBRARY_CABINS: "MANAGE_LIBRARY_CABINS",
    VIEW_ALL_CLUBS: "VIEW_ALL_CLUBS",
    MANAGE_CLUBS: "MANAGE_CLUBS",
    MANAGE_CLUB_BUDGET: "MANAGE_CLUB_BUDGET",
    MANAGE_CLANS: "MANAGE_CLANS",
    ALLOCATE_CLAN_POINTS: "ALLOCATE_CLAN_POINTS",
    MANAGE_CLAN_INITIATIVES: "MANAGE_CLAN_INITIATIVES",
    SUBMIT_EXPENSE: "SUBMIT_EXPENSE",
    APPROVE_EXPENSE: "APPROVE_EXPENSE",
    SUBMIT_REIMBURSEMENT: "SUBMIT_REIMBURSEMENT",
    REVIEW_REIMBURSEMENT: "REVIEW_REIMBURSEMENT",
    PROCESS_REIMBURSEMENT: "PROCESS_REIMBURSEMENT",
    VIEW_ALL_BUDGETS: "VIEW_ALL_BUDGETS",
    CREATE_ACHIEVEMENT: "CREATE_ACHIEVEMENT",
    APPROVE_ACHIEVEMENT: "APPROVE_ACHIEVEMENT",
    SUBMIT_PRODUCT: "SUBMIT_PRODUCT",
    APPROVE_PRODUCT: "APPROVE_PRODUCT",
    UPLOAD_FILE: "UPLOAD_FILE",
    DELETE_FILE: "DELETE_FILE",
    VIEW_ANALYTICS: "VIEW_ANALYTICS",
    VIEW_APPROVALS: "VIEW_APPROVALS",
    MANAGE_ACCESS: "MANAGE_ACCESS",
    GENERATE_REPORT: "GENERATE_REPORT",
    MANAGE_SEMESTER: "MANAGE_SEMESTER",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export function can(permissions: string[] | undefined, permission: Permission): boolean {
    return !!permissions && permissions.includes(permission);
}

export const ROLE_LABELS: Record<LxMemberRole, string> = {
    ADMIN: "Admin",
    LX_TEAM: "LX Team",
    CLUB_HEAD: "Club Head",
    CLAN_HEAD: "Clan Head",
    FINANCE: "Finance",
    LIBRARIAN: "Librarian",
    GUEST: "General Access",
};

export const ROLE_BADGE: Record<LxMemberRole, { bg: string; fg: string }> = {
    ADMIN: { bg: "var(--error-subtle)", fg: "var(--error-subtle-foreground)" },
    LX_TEAM: { bg: "var(--secondary-subtle)", fg: "var(--secondary-subtle-foreground)" },
    FINANCE: { bg: "var(--success-subtle)", fg: "var(--success-subtle-foreground)" },
    CLUB_HEAD: { bg: "var(--info-subtle)", fg: "var(--info-subtle-foreground)" },
    CLAN_HEAD: { bg: "var(--warning-subtle)", fg: "var(--warning-subtle-foreground)" },
    LIBRARIAN: { bg: "var(--info-subtle)", fg: "var(--info-subtle-foreground)" },
    GUEST: { bg: "var(--muted)", fg: "var(--text-subheading)" },
};
