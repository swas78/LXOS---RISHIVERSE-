"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import Link from "next/link";
import { Shield, TrendingUp } from "lucide-react";
import { Button, SheetCancelButton, SheetSubmitButton } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { useClans } from "./hooks/useClans";
import type { LxClan } from "@/features/lx/clan/types";
import { scopedInr } from "@/lib/money";
import { useBudgetAwareness, useCan } from "@/hooks/useCan";
import { PERMISSIONS } from "@/lib/permissions";

export default function ClansPage() {
    const { clans, loading, managePoints } = useClans();
    const { can } = useCan();
    const canManage = can(PERMISSIONS.MANAGE_CLANS);
    // Columns of em dashes still announce that budgets exist — for someone with
    // no budget role the columns are dropped entirely.
    const budgetAware = useBudgetAwareness();
    const [managing, setManaging] = useState<LxClan | null>(null);

    const totalPoints = clans.reduce((s, c) => s + c.points, 0) || 1;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-primary-text">Clans</h1>
                <p className="mt-1 text-sm text-text-body">
                    Friendly competition, properly tracked — a live leaderboard, not an Excel sheet.
                </p>
            </div>

            {/* Colour-coded summary cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {clans.map((c, i) => (
                    <div
                        key={c.id}
                        className="relative overflow-hidden rounded-2xl border border-border-subtle bg-card p-5 shadow-xs"
                    >
                        <div
                            className="absolute inset-x-0 top-0 h-1"
                            style={{ background: c.color }}
                        />
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                                <span
                                    className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                                    style={{ background: c.color }}
                                >
                                    {i + 1}
                                </span>
                                {c.name}
                            </span>
                            <Shield className="h-4 w-4" style={{ color: c.color }} />
                        </div>
                        <p className="mt-3 text-3xl font-bold" style={{ color: c.color }}>
                            {c.points}
                        </p>
                        <p className="text-xs text-text-body">
                            {Math.round((c.points / totalPoints) * 100)}% of total points
                        </p>
                        <div className="mt-3 flex gap-2">
                            <Link
                                href={`/lx/clans/${c.id}`}
                                className="text-xs text-primary hover:underline"
                            >
                                View details
                            </Link>
                        </div>
                        {canManage && (
                            <Button
                                variant="outline"
                                className="mt-3 w-full gap-1.5 text-xs"
                                onClick={() => setManaging(c)}
                            >
                                <TrendingUp className="h-3.5 w-3.5" /> Manage points
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            {loading && clans.length === 0 && (
                <p className="text-sm text-text-body">Loading clans…</p>
            )}

            {/* Ranked table */}
            {clans.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-card">
                    <table className="w-full min-w-[480px] text-sm">
                        <thead className="border-b border-border bg-subtle text-left text-xs text-text-body">
                            <tr>
                                <th className="px-4 py-2.5 font-medium">Rank</th>
                                <th className="px-4 py-2.5 font-medium">Clan</th>
                                <th className="px-4 py-2.5 font-medium">Points</th>
                                {budgetAware && (
                                    <>
                                        <th className="px-4 py-2.5 font-medium">Budget spent</th>
                                        <th className="px-4 py-2.5 font-medium">Budget left</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {clans.map((c, i) => (
                                <tr key={c.id} className="hover:bg-subtle">
                                    <td className="px-4 py-3 font-semibold">#{i + 1}</td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/lx/clans/${c.id}`}
                                            className="inline-flex items-center gap-2 font-medium hover:underline"
                                        >
                                            <span
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{ background: c.color }}
                                            />
                                            {c.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 font-semibold">{c.points}</td>
                                    {/* For a budget-aware viewer the columns stay in place and
                      rows they may not read show an em dash — rendering ₹0
                      would claim the clan spent nothing. For everyone else the
                      columns are absent entirely. */}
                                    {budgetAware && (
                                        <>
                                            <td className="px-4 py-3 text-text-body">
                                                {scopedInr(c.budgetSpent)}
                                            </td>
                                            <td className="px-4 py-3 text-text-body">
                                                {scopedInr(
                                                    c.budgetAllocated != null &&
                                                        c.budgetSpent != null
                                                        ? c.budgetAllocated - c.budgetSpent
                                                        : null,
                                                )}
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {managing && (
                <ManagePointsModal
                    clan={managing}
                    onClose={() => setManaging(null)}
                    onSubmit={async (delta, reason) => {
                        const ok = await managePoints(managing.id, { delta, reason });
                        if (ok) setManaging(null);
                    }}
                />
            )}
        </div>
    );
}

function ManagePointsModal({
    clan,
    onClose,
    onSubmit,
}: {
    clan: LxClan;
    onClose: () => void;
    onSubmit: (delta: number, reason: string) => void;
}) {
    const [delta, setDelta] = useState("");
    const [reason, setReason] = useState("");
    const field =
        "w-full rounded-input border border-input bg-card px-3 py-2 text-sm text-text-heading outline-none transition-colors placeholder:text-text-placeholder focus:border-border-focus";

    return (
        <Sheet
            open
            onClose={onClose}
            title={
                <>
                    Manage points · <span style={{ color: clan.color }}>{clan.name}</span>
                </>
            }
            description={`Current: ${clan.points} pts. Use a negative number to deduct.`}
            footer={
                <>
                    <SheetCancelButton onClick={onClose}>Cancel</SheetCancelButton>
                    <SheetSubmitButton
                        onClick={() => {
                            const d = Number(delta);
                            if (!d || !reason.trim()) return;
                            onSubmit(d, reason.trim());
                        }}
                    >
                        Apply
                    </SheetSubmitButton>
                </>
            }
        >
            <div className="space-y-3">
                <input
                    type="number"
                    className={field}
                    placeholder="Points change (e.g. 10 or -5)"
                    value={delta}
                    onChange={(e) => setDelta(e.target.value)}
                />
                <input
                    className={field}
                    placeholder="Reason (required)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
            </div>
        </Sheet>
    );
}
