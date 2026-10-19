import {
    Activity,
    Award,
    BarChart3,
    BookOpen,
    PackageSearch,
    CalendarDays,
    CheckSquare,
    DoorOpen,
    FileBarChart,
    FileText,
    LayoutDashboard,
    Receipt,
    Rocket,
    Shield,
    ShieldCheck,
    Users,
    Wallet,
} from "lucide-react";
import { PERMISSIONS, type Permission } from "@/lib/permissions";

export type Ctx = { can: (p: Permission) => boolean; role: string | null };

export type Rule = (ctx: Ctx) => boolean;

// Every gated area has exactly one rule defined here.
export const RULES = {
    events: ({ can }) =>
        can(PERMISSIONS.CREATE_EVENT) ||
        can(PERMISSIONS.APPROVE_EVENT) ||
        can(PERMISSIONS.VIEW_ALL_EVENTS),
    expenses: ({ can }) => can(PERMISSIONS.SUBMIT_EXPENSE) || can(PERMISSIONS.APPROVE_EXPENSE),
    budget: ({ can, role }) =>
        can(PERMISSIONS.VIEW_ALL_BUDGETS) || role === "CLUB_HEAD" || role === "CLAN_HEAD",
    approvals: ({ can }) => can(PERMISSIONS.VIEW_APPROVALS),
    analytics: ({ can }) => can(PERMISSIONS.VIEW_ANALYTICS),
    report: ({ can }) => can(PERMISSIONS.GENERATE_REPORT),
    access: ({ can }) => can(PERMISSIONS.MANAGE_ACCESS),
    reimbursements: ({ can }) =>
        can(PERMISSIONS.SUBMIT_REIMBURSEMENT) ||
        can(PERMISSIONS.REVIEW_REIMBURSEMENT) ||
        can(PERMISSIONS.PROCESS_REIMBURSEMENT),
    rooms: ({ can, role }) =>
        can(PERMISSIONS.BOOK_ROOM) || can(PERMISSIONS.MANAGE_ROOMS) || role === "ADMIN",
    files: ({ can, role }) =>
        can(PERMISSIONS.UPLOAD_FILE) || role === "ADMIN" || role === "LX_TEAM",
} satisfies Record<string, Rule>;

// Route table: both the sidebar AND the layout guard read this.
// Routes with no rule = visible to everyone.
export const LX_ROUTES = [
    { label: "Dashboard", href: "/lx/dashboard", icon: LayoutDashboard },
    { label: "Events", href: "/lx/events", icon: CalendarDays },
    { label: "Rooms", href: "/lx/rooms", icon: DoorOpen, rule: RULES.rooms },
    { label: "Library Cabins", href: "/lx/library", icon: BookOpen },
    { label: "Lost & Found", href: "/lx/lost-found", icon: PackageSearch },
    { label: "Calendar", href: "/lx/calendar", icon: CalendarDays },
    { label: "Clubs", href: "/lx/clubs", icon: Users },
    { label: "Clans", href: "/lx/clans", icon: Shield },
    { label: "Achievements", href: "/lx/achievements", icon: Award },
    { label: "Learner Products", href: "/lx/products", icon: Rocket },
    {
        label: "Reimbursements",
        href: "/lx/reimbursements",
        icon: Receipt,
        rule: RULES.reimbursements,
    },
    { label: "Expenses", href: "/lx/expenses", icon: Wallet, rule: RULES.expenses },
    { label: "Budget", href: "/lx/budget", icon: Wallet, rule: RULES.budget },
    { label: "Approvals", href: "/lx/approvals", icon: CheckSquare, rule: RULES.approvals },
    { label: "Activity Feed", href: "/lx/feed", icon: Activity },
    { label: "Analytics", href: "/lx/analytics", icon: BarChart3, rule: RULES.analytics },
    { label: "LX Report", href: "/lx/report", icon: FileBarChart, rule: RULES.report },
    { label: "Files", href: "/lx/files", icon: FileText, rule: RULES.files },
    { label: "Access", href: "/lx/access", icon: ShieldCheck, rule: RULES.access },
];
