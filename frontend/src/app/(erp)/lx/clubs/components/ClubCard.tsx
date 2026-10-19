"use client";

import Link from "next/link";
import { Lock, Trash2, UserRound, Wallet } from "lucide-react";
import type { LxClub } from "@/features/lx/club/types";
import { useBudgetAwareness } from "@/hooks/useCan";
import { CATEGORY_META, formatMoney } from "./categoryMeta";
import { Badge } from "@/components/ui/badge";

export function ClubCard({ club, onDelete }: { club: LxClub; onDelete?: (club: LxClub) => void }) {
    const meta = CATEGORY_META[club.category];
    // Someone with no budget role should not learn that budgets exist.
    const budgetAware = useBudgetAwareness();
    // Budgets are scoped by the backend: null means "you may not see this", which
    // is NOT the same as zero. `|| 0` here would render "₹0 / ₹0 · 0% used" for
    // every club this actor cannot read — a false statement rather than a hidden
    // one — so the whole block is swapped for a lock note instead.
    const canSeeBudget = club.budgetVisible && club.budgetAllocated != null;
    const allocated = club.budgetAllocated ?? 0;
    const spent = club.budgetSpent ?? 0;
    const remaining = allocated - spent;
    const pct = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;
    const overBudget = spent > allocated && allocated > 0;

    return (
        <Link
            href={`/lx/clubs/${club.id}`}
            className="flex flex-col rounded-2xl border border-border-subtle bg-card p-5 shadow-xs transition hover:shadow-md"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <h3 className="truncate font-semibold leading-tight">{club.name}</h3>
                    <p className="mt-0.5 line-clamp-2 text-xs text-text-body">{club.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                    <Badge tone={meta.tone} dot className="mt-0.5">
                        {meta.label}
                    </Badge>
                    {onDelete && (
                        <button
                            type="button"
                            title="Remove club"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDelete(club);
                            }}
                            className="rounded-card p-1 text-text-body hover:bg-error-subtle hover:text-error"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {!budgetAware ? null : !canSeeBudget ? (
                <div className="mt-4 flex items-center gap-1.5 rounded-lg border border-dashed border-border px-2.5 py-2 text-xs text-text-body">
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                    Budget visible to this club&apos;s head and the LX team
                </div>
            ) : (
                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-text-body">
                        <span>Budget used</span>
                        <span className="font-medium text-foreground">
                            {formatMoney(spent)} / {formatMoney(allocated)}
                        </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full transition-all"
                            style={{
                                width: `${allocated > 0 ? Math.max(pct, spent > 0 ? 4 : 0) : 0}%`,
                                background: overBudget ? "var(--error)" : "var(--brand)",
                            }}
                        />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1 text-text-body">
                            <Wallet className="h-3.5 w-3.5" /> Remaining
                        </span>
                        <span
                            className={
                                remaining < 0
                                    ? "font-semibold text-error"
                                    : "font-semibold text-text-heading"
                            }
                        >
                            {formatMoney(remaining)}
                        </span>
                    </div>
                </div>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-text-body">
                <span className="inline-flex items-center gap-1.5">
                    <UserRound className="h-3.5 w-3.5" />
                    {club.headName || "No head assigned"}
                </span>
                {!club.isActive && (
                    <span className="rounded-card bg-muted px-2 py-0.5 font-medium text-text-body">
                        Inactive
                    </span>
                )}
            </div>
        </Link>
    );
}
