"use client";

import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBudgetThunk } from "@/features/lx/budget/budgetThunks";
import { StatTile, StatTileRow } from "@/components/ui/stat-tile";

const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

function ProgressBar({ pct }: { pct: number }) {
    const clamped = Math.min(100, Math.max(0, pct));
    const color = clamped > 90 ? "var(--error)" : clamped > 70 ? "var(--warning)" : "var(--brand)";
    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
                className="h-full rounded-full"
                style={{ width: `${clamped}%`, background: color }}
            />
        </div>
    );
}

export default function BudgetPage() {
    const dispatch = useAppDispatch();
    const data = useAppSelector((s) => s.lxBudget.data);
    const loading = useAppSelector((s) => s.lxBudget.loading);

    useEffect(() => {
        void dispatch(fetchBudgetThunk());
    }, [dispatch]);

    const t = data?.totals;
    // Tone, not an icon — the widget guide's tiles carry a word and a number.
    const cards = [
        { label: "Total Allocated", value: t?.totalAllocated, tone: "brand" },
        { label: "Total Spent", value: t?.totalSpent, tone: "warning" },
        { label: "Remaining", value: t?.totalRemaining, tone: "success" },
        { label: "Approved Expenses", value: t?.approvedExpenses, tone: "info" },
    ] as const;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-primary-text">Budget</h1>
                <p className="mt-1 text-sm text-text-body">
                    Live allocation and spend across all clubs and clans — no spreadsheets.
                </p>
            </div>

            {data?.scoped && (
                <div className="rounded-lg border border-warning-subtle bg-warning-subtle px-3 py-2 text-sm text-warning">
                    You&apos;re viewing only your {data.scopeRole === "CLAN_HEAD" ? "clan" : "club"}
                    &apos;s budget. Admin, LX and Finance see all clubs and clans.
                </div>
            )}

            <StatTileRow>
                {cards.map((c) => (
                    <StatTile
                        key={c.label}
                        label={c.label}
                        value={c.value === undefined ? (loading ? "…" : "—") : inr.format(c.value)}
                        tone={c.tone}
                    />
                ))}
            </StatTileRow>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Clubs */}
                <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-xs">
                    <h2 className="text-sm font-semibold">Clubs</h2>
                    <div className="mt-3 space-y-3">
                        {data?.clubs?.length ? (
                            data.clubs.map((c) => (
                                <div key={c.id}>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{c.name}</span>
                                        <span className="text-text-body">
                                            {inr.format(c.budgetRemaining)} left · {c.utilization}%
                                        </span>
                                    </div>
                                    <div className="mt-1.5">
                                        <ProgressBar pct={c.utilization} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-text-body">
                                {loading ? "Loading…" : "No clubs."}
                            </p>
                        )}
                    </div>
                </div>

                {/* Clans */}
                <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-xs">
                    <h2 className="text-sm font-semibold">Clans</h2>
                    <div className="mt-3 space-y-3">
                        {data?.clans?.length ? (
                            data.clans.map((c) => (
                                <div key={c.id}>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="inline-flex items-center gap-2 font-medium">
                                            <span
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{ background: c.color }}
                                            />
                                            {c.name}
                                        </span>
                                        <span className="text-text-body">
                                            {inr.format(c.budgetRemaining)} left · {c.utilization}%
                                        </span>
                                    </div>
                                    <div className="mt-1.5">
                                        <ProgressBar pct={c.utilization} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-text-body">
                                {loading ? "Loading…" : "No clans."}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
