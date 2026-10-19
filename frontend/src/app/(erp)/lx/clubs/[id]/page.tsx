"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    CalendarDays,
    Lock,
    Mail,
    Pencil,
    TrendingDown,
    UserRound,
    Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    selectClubDetailLoading,
    selectClubsError,
    selectCurrentClub,
} from "@/features/lx/club/clubSelectors";
import { fetchClubByIdThunk } from "@/features/lx/club/clubThunks";
import { CATEGORY_META, formatMoney } from "../components/categoryMeta";
import { Badge } from "@/components/ui/badge";
import { EditClubForm } from "../components/EditClubForm";
import { EntityBlog } from "@/components/lx/EntityBlog";
import { useCan } from "@/hooks/useCan";
import { PERMISSIONS } from "@/lib/permissions";
import { useBudgetAwareness } from "@/hooks/useCan";

export default function ClubDetailPage() {
    const params = useParams<{ id: string }>();
    const id = params?.id;
    const dispatch = useAppDispatch();
    const club = useAppSelector(selectCurrentClub);
    const loading = useAppSelector(selectClubDetailLoading);
    const error = useAppSelector(selectClubsError);
    const { can } = useCan();
    // Must sit with the other hooks: it was below the `if (!club) return`, so it
    // ran conditionally and React's hook order broke on the not-found render.
    const budgetAware = useBudgetAwareness();
    const actor = useAppSelector((s) => s.lxActor.current);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (id) void dispatch(fetchClubByIdThunk(id));
    }, [dispatch, id]);

    if (loading) {
        return <p className="text-sm text-text-body">Loading club…</p>;
    }

    if (error && !club) {
        return (
            <div className="space-y-4">
                <BackLink />
                <p className="text-sm text-error">{error}</p>
            </div>
        );
    }

    if (!club) {
        return (
            <div className="space-y-4">
                <BackLink />
                <p className="text-sm text-text-body">Club not found.</p>
            </div>
        );
    }

    const meta = CATEGORY_META[club.category];
    // Scoped by the backend — null is "hidden", not zero. Coercing with `|| 0`
    // would render a confident "₹0 spent · 0% used" for clubs this actor may not
    // read. The stat cards and utilisation bar are hidden instead.
    const canSeeBudget = club.budgetVisible && club.budgetAllocated != null;
    const allocated = club.budgetAllocated ?? 0;
    const spent = club.budgetSpent ?? 0;
    const remaining = allocated - spent;
    const pct = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;
    const overBudget = spent > allocated && allocated > 0;

    return (
        <div className="space-y-6">
            <BackLink />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold text-primary-text">{club.name}</h1>
                        <Badge tone={meta.tone} dot className="px-2.5">
                            {meta.label}
                        </Badge>
                        {!club.isActive && (
                            <span className="rounded-card bg-muted px-2 py-0.5 text-xs font-medium text-text-body">
                                Inactive
                            </span>
                        )}
                    </div>
                    <p className="mt-2 max-w-2xl text-sm text-text-body">{club.description}</p>
                </div>
                {can(PERMISSIONS.MANAGE_CLUBS) && (
                    <Button
                        variant="outline"
                        className="shrink-0 gap-1.5"
                        onClick={() => setEditing(true)}
                    >
                        <Pencil className="h-4 w-4" /> Edit club
                    </Button>
                )}
            </div>

            {editing && club && <EditClubForm club={club} onClose={() => setEditing(false)} />}

            {canSeeBudget ? (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <StatCard
                            label="Allocated"
                            value={formatMoney(allocated)}
                            icon={<Wallet className="h-4 w-4" />}
                            accent="var(--chart-2)"
                        />
                        <StatCard
                            label="Spent"
                            value={formatMoney(spent)}
                            icon={<TrendingDown className="h-4 w-4" />}
                            accent={overBudget ? "var(--error)" : "var(--brand)"}
                        />
                        <StatCard
                            label="Remaining"
                            value={formatMoney(remaining)}
                            icon={<Wallet className="h-4 w-4" />}
                            accent={remaining < 0 ? "var(--error)" : "var(--icon-secondary)"}
                        />
                    </div>

                    <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-xs">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Budget utilisation</span>
                            <span className="text-text-body">
                                {pct}% used{overBudget ? " · over budget" : ""}
                            </span>
                        </div>
                        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${allocated > 0 ? Math.max(pct, spent > 0 ? 4 : 0) : 0}%`,
                                    background: overBudget ? "var(--error)" : "var(--brand)",
                                }}
                            />
                        </div>
                    </div>
                </>
            ) : budgetAware ? (
                <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 py-3 text-sm text-text-body">
                    <Lock className="h-4 w-4 shrink-0" />
                    Budget and spending for this club are visible to its own head and the LX team.
                </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoCard title="Club Head">
                    <InfoRow
                        icon={<UserRound className="h-4 w-4" />}
                        value={club.headName || "Not assigned"}
                    />
                    <InfoRow icon={<Mail className="h-4 w-4" />} value={club.headEmail || "—"} />
                </InfoCard>
                <InfoCard title="Details">
                    <InfoRow
                        icon={<CalendarDays className="h-4 w-4" />}
                        label="Semester"
                        value={club.semester}
                    />
                    <InfoRow label="Category" value={meta.label} />
                </InfoCard>
            </div>

            <EntityBlog
                kind="club"
                id={club.id}
                name={club.name}
                canPost={
                    actor?.role === "ADMIN" ||
                    (actor?.role === "CLUB_HEAD" && actor?.clubId === club.id)
                }
            />
        </div>
    );
}

function BackLink() {
    return (
        <Link
            href="/lx/clubs"
            className="inline-flex items-center gap-1.5 text-sm text-text-body transition hover:text-foreground"
        >
            <ArrowLeft className="h-4 w-4" /> Back to clubs
        </Link>
    );
}

function StatCard({
    label,
    value,
    icon,
    accent,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
    accent: string;
}) {
    return (
        <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-medium text-text-body">
                <span style={{ color: accent }}>{icon}</span>
                {label}
            </div>
            <p className="mt-2 text-xl font-semibold" style={{ color: accent }}>
                {value}
            </p>
        </div>
    );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-xs">
            <h3 className="text-sm font-semibold">{title}</h3>
            <div className="mt-3 space-y-2">{children}</div>
        </div>
    );
}

function InfoRow({
    icon,
    label,
    value,
}: {
    icon?: React.ReactNode;
    label?: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-2 text-sm">
            {icon && <span className="text-text-body">{icon}</span>}
            {label && <span className="text-text-body">{label}:</span>}
            <span className="truncate text-foreground">{value}</span>
        </div>
    );
}
