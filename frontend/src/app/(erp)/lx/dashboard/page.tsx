"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
    Award,
    BarChart3,
    CalendarDays,
    CheckSquare,
    DoorOpen,
    Plus,
    Receipt,
    Shield,
    Users,
    Wallet,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDashboardThunk } from "@/features/lx/dashboard/dashboardThunks";
import { fetchMeThunk } from "@/features/lx/actor/actorThunks";
import { useCan } from "@/hooks/useCan";
import { PERMISSIONS } from "@/lib/permissions";
import { EventStatusBadge } from "../events/components/EventStatusBadge";
import { EventTypeBadge } from "../events/components/EventTypeBadge";
import { formatDate } from "../events/utils/format";
import { StatTile, StatTileRow } from "@/components/ui/stat-tile";

type QuickAction = { label: string; href: string; icon: typeof DoorOpen };

const ACTIONS_BY_ROLE: Record<string, QuickAction[]> = {
    ADMIN: [
        { label: "Approvals", href: "/lx/approvals", icon: CheckSquare },
        { label: "Budget", href: "/lx/budget", icon: Wallet },
        { label: "Analytics", href: "/lx/analytics", icon: BarChart3 },
    ],
    LX_TEAM: [
        { label: "Approvals", href: "/lx/approvals", icon: CheckSquare },
        { label: "New Event", href: "/lx/events", icon: Plus },
        { label: "Analytics", href: "/lx/analytics", icon: BarChart3 },
    ],
    CLUB_HEAD: [
        { label: "Request Event", href: "/lx/events", icon: Plus },
        { label: "My Clubs", href: "/lx/clubs", icon: Users },
        { label: "Reimbursement", href: "/lx/reimbursements", icon: Receipt },
    ],
    CLAN_HEAD: [
        { label: "My Clan", href: "/lx/clans", icon: Shield },
        { label: "Request Event", href: "/lx/events", icon: Plus },
        { label: "Achievements", href: "/lx/achievements", icon: Award },
    ],
    FINANCE: [
        { label: "Reimbursements", href: "/lx/reimbursements", icon: Receipt },
        { label: "Budget", href: "/lx/budget", icon: Wallet },
        { label: "Analytics", href: "/lx/analytics", icon: BarChart3 },
    ],
    GUEST: [
        { label: "Events", href: "/lx/events", icon: CalendarDays },
        { label: "Achievements", href: "/lx/achievements", icon: Award },
        { label: "Rooms", href: "/lx/rooms", icon: DoorOpen },
    ],
};

// Tone is what the number means, per the widget guide — not decoration.
const STAT_META = [
    { key: "totalEvents", label: "Total Events", tone: "brand" },
    { key: "activeClubs", label: "Active Clubs", tone: "info" },
    { key: "clans", label: "Clans", tone: "success" },
    { key: "upcomingEvents", label: "Upcoming", tone: "warning" },
] as const;

export default function DashboardPage() {
    const dispatch = useAppDispatch();
    const data = useAppSelector((s) => s.lxDashboard.data);
    const loading = useAppSelector((s) => s.lxDashboard.loading);
    const actor = useAppSelector((s) => s.lxActor.current);
    const { can } = useCan();
    const canSeeApprovals = can(PERMISSIONS.VIEW_APPROVALS);

    useEffect(() => {
        void dispatch(fetchDashboardThunk());
        void dispatch(fetchMeThunk());
    }, [dispatch]);

    const today = new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
    }).format(new Date());

    const actions = ACTIONS_BY_ROLE[actor?.role ?? "GUEST"] ?? ACTIONS_BY_ROLE.GUEST;
    const firstName = actor?.displayName?.split(" ")[0] ?? "there";
    const pending = data?.pendingApprovals?.total ?? 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary-text">Hi {firstName}</h1>
                    <p className="mt-1 text-sm text-text-body">{today}</p>
                </div>
                {pending > 0 && canSeeApprovals && (
                    <Link
                        href="/lx/approvals"
                        className="inline-flex items-center gap-2 rounded-full bg-warning-subtle px-3 py-1.5 text-sm font-medium text-warning hover:bg-warning-subtle/70"
                    >
                        <CheckSquare className="h-4 w-4" />
                        {pending} pending approval{pending > 1 ? "s" : ""}
                    </Link>
                )}
            </div>

            {/* Summary tiles — label above the number, flat tint, no border. */}
            <StatTileRow>
                {STAT_META.map((m) => {
                    const value = data?.stats?.[m.key] ?? (loading ? "…" : 0);
                    return <StatTile key={m.key} label={m.label} value={value} tone={m.tone} />;
                })}
            </StatTileRow>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Next up + Quick actions */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-xs">
                        <h2 className="text-sm font-semibold">Next Up</h2>
                        {data?.nextUp ? (
                            <Link
                                href={`/lx/events/${data.nextUp.event.id}`}
                                className="mt-3 block"
                            >
                                <p className="font-medium">{data.nextUp.event.title}</p>
                                <p className="mt-1 text-sm text-text-body">
                                    {formatDate(data.nextUp.event.startDate)} ·{" "}
                                    {data.nextUp.daysAway === 0
                                        ? "Today"
                                        : `in ${data.nextUp.daysAway} day${data.nextUp.daysAway > 1 ? "s" : ""}`}
                                </p>
                            </Link>
                        ) : (
                            <p className="mt-3 text-sm text-text-body">No upcoming events.</p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-xs">
                        <h2 className="text-sm font-semibold">Quick Actions</h2>
                        <div className="mt-3 grid grid-cols-1 gap-2">
                            {actions.map((a) => {
                                const Icon = a.icon;
                                return (
                                    <Link
                                        key={a.href + a.label}
                                        href={a.href}
                                        className="flex items-center gap-2.5 rounded-card border border-border px-3 py-2 text-sm hover:bg-subtle"
                                    >
                                        <Icon className="h-4 w-4 text-primary" />
                                        {a.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Recent events */}
                <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-xs lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold">Recent Events</h2>
                        <Link href="/lx/events" className="text-xs text-primary hover:underline">
                            View all
                        </Link>
                    </div>
                    <div className="mt-3 divide-y divide-border">
                        {data?.recentEvents?.length ? (
                            data.recentEvents.map((e) => (
                                <Link
                                    key={e.id}
                                    href={`/lx/events/${e.id}`}
                                    className="flex items-center justify-between gap-3 py-2.5 hover:opacity-80"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">{e.title}</p>
                                        <p className="text-xs text-text-body">
                                            {formatDate(e.startDate)}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <EventTypeBadge type={e.type} />
                                        <EventStatusBadge status={e.status} />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="py-4 text-sm text-text-body">No events yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
