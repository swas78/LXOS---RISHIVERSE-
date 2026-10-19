"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { useClan } from "../hooks/useClans";
import { EditClanForm } from "../components/EditClanForm";
import { EntityBlog } from "@/components/lx/EntityBlog";
import type { LxInitiative } from "@/features/lx/initiative/types";
import { HIDDEN } from "@/lib/money";
import { useBudgetAwareness, useCan } from "@/hooks/useCan";
import { toast } from "sonner";
import { initiativeApi } from "@/features/lx/initiative/initiativeApi";
import type { LxInitiativePriority } from "@/features/lx/initiative/types";
import { PERMISSIONS } from "@/lib/permissions";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
// Budget figures are scoped — see lib/money.ts. `null` renders as an em dash.
const scoped = (n: number | null) => (n == null ? HIDDEN : inr(n));
const fmtDate = (v: string) =>
    new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(
        new Date(v),
    );

const PRIORITY_COLOR: Record<string, { bg: string; fg: string }> = {
    HIGH: { bg: "var(--error-subtle)", fg: "var(--error-subtle-foreground)" },
    MEDIUM: { bg: "var(--warning-subtle)", fg: "var(--warning-subtle-foreground)" },
    LOW: { bg: "var(--success-subtle)", fg: "var(--success-subtle-foreground)" },
};
const STATUS_COLOR: Record<string, { bg: string; fg: string }> = {
    PLANNING: { bg: "var(--muted)", fg: "var(--text-subheading)" },
    ACTIVE: { bg: "var(--info-subtle)", fg: "var(--info-subtle-foreground)" },
    COMPLETED: { bg: "var(--success-subtle)", fg: "var(--success-subtle-foreground)" },
};

export default function ClanDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { clan, loading } = useClan(id);
    const actor = useAppSelector((s) => s.lxActor.current);
    // No budget role at all → the section is absent, not locked.
    const budgetAware = useBudgetAwareness();
    const { can } = useCan();
    // A clan head manages ONLY the clan they lead. Without the id comparison the
    // Add button appears on every clan's page and the write fails with a 403 that
    // the user never asked for — the affordance has to match the permission.
    const canManage =
        can(PERMISSIONS.MANAGE_CLANS) ||
        (can(PERMISSIONS.MANAGE_CLAN_INITIATIVES) && actor?.clanId === id);

    const [initiatives, setInitiatives] = useState<LxInitiative[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<{
        title: string;
        description: string;
        priority: LxInitiativePriority;
        progress: string;
    }>({ title: "", description: "", priority: "MEDIUM", progress: "" });

    const loadInitiatives = useCallback(() => {
        initiativeApi
            .getAll({ clanId: id, limit: 100 })
            .then((r) => setInitiatives(r.data))
            .catch(() => {});
    }, [id]);

    useEffect(() => {
        loadInitiatives();
    }, [loadInitiatives]);

    const addInitiative = async () => {
        if (!form.title.trim()) return;
        try {
            await initiativeApi.create({
                title: form.title.trim(),
                description: form.description.trim(),
                clanId: id,
                clanName: clan?.name,
                priority: form.priority,
                progress: form.progress ? Number(form.progress) : 0,
            });
            setForm({ title: "", description: "", priority: "MEDIUM", progress: "" });
            setShowForm(false);
            toast.success("Initiative created");
            loadInitiatives();
        } catch (err) {
            // Surface scope rejections ("only your own clan") rather than failing mute.
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                "Could not create the initiative.";
            toast.error(message);
        }
    };

    if (loading && !clan) return <p className="text-sm text-text-body">Loading…</p>;
    if (!clan) return <p className="text-sm text-text-body">Clan not found.</p>;

    const history = clan.pointTxns ?? [];
    const field =
        "w-full rounded-input border border-input bg-card px-3 py-2 text-sm text-text-heading outline-none transition-colors placeholder:text-text-placeholder focus:border-border-focus";

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <Link
                href="/lx/clans"
                className="inline-flex items-center gap-1.5 text-sm text-text-body hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" /> Back to clans
            </Link>

            {editing && <EditClanForm clan={clan} onClose={() => setEditing(false)} />}

            {/* Header */}
            <div className="overflow-hidden rounded-2xl border border-border-subtle bg-card">
                <div className="h-2" style={{ background: clan.color }} />
                <div className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-2xl font-bold text-primary-text">{clan.name}</h1>
                        <div className="flex items-center gap-3">
                            {can(PERMISSIONS.MANAGE_CLANS) && (
                                <Button
                                    variant="outline"
                                    className="gap-1.5"
                                    onClick={() => setEditing(true)}
                                >
                                    <Pencil className="h-4 w-4" /> Edit
                                </Button>
                            )}
                            <span className="text-3xl font-bold" style={{ color: clan.color }}>
                                {clan.points} pts
                            </span>
                        </div>
                    </div>
                    {clan.description && (
                        <p className="mt-2 text-sm text-text-body">{clan.description}</p>
                    )}
                    {/* Budgets are scoped to this clan's own head plus the finance roles.
              On a single-entity page three em dashes would say nothing, so the
              block is omitted entirely rather than rendered blank. */}
                    {clan.budgetVisible ? (
                        <div className="mt-4 grid grid-cols-3 gap-4">
                            <Stat label="Allocated" value={scoped(clan.budgetAllocated)} />
                            <Stat label="Spent" value={scoped(clan.budgetSpent)} />
                            <Stat
                                label="Remaining"
                                value={scoped(
                                    clan.budgetAllocated != null && clan.budgetSpent != null
                                        ? clan.budgetAllocated - clan.budgetSpent
                                        : null,
                                )}
                            />
                        </div>
                    ) : budgetAware ? (
                        <p className="mt-4 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-text-body">
                            Budget details are visible to this clan&apos;s head and the LX team.
                        </p>
                    ) : null}
                </div>
            </div>

            {/* Point history */}
            <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-xs">
                <h2 className="text-sm font-semibold">Point History</h2>
                {history.length === 0 ? (
                    <p className="mt-3 text-sm text-text-body">No point changes recorded yet.</p>
                ) : (
                    <ol className="mt-3 space-y-3">
                        {history.map((h) => {
                            const delta = h.delta ?? h.points - h.previousPoints;
                            const up = delta >= 0;
                            return (
                                <li key={h.id} className="flex items-start gap-3">
                                    <span
                                        className={`mt-0.5 inline-flex h-6 min-w-[2.75rem] items-center justify-center rounded-full px-1 text-xs font-bold ${up ? "bg-success-subtle text-success" : "bg-error-subtle text-error"}`}
                                    >
                                        {up ? "+" : ""}
                                        {delta}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm">{h.reason}</p>
                                        <p className="text-xs text-text-body">
                                            {h.previousPoints} → {h.points} · {fmtDate(h.date)}
                                            {h.createdByName ? ` · ${h.createdByName}` : ""}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                )}
            </div>

            {/* Initiatives */}
            <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-xs">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Initiatives</h2>
                    {canManage && (
                        <Button
                            variant="outline"
                            className="gap-1.5 text-xs"
                            onClick={() => setShowForm((v) => !v)}
                        >
                            <Plus className="h-3.5 w-3.5" /> Add
                        </Button>
                    )}
                </div>

                {showForm && (
                    <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg border border-border p-3 sm:grid-cols-2">
                        <input
                            className={field}
                            placeholder="Title"
                            value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                        />
                        <input
                            className={field}
                            placeholder="Progress % (0-100)"
                            type="number"
                            value={form.progress}
                            onChange={(e) => setForm((f) => ({ ...f, progress: e.target.value }))}
                        />
                        <input
                            className={`${field} sm:col-span-2`}
                            placeholder="Description"
                            value={form.description}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, description: e.target.value }))
                            }
                        />
                        <select
                            className={field}
                            value={form.priority}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    priority: e.target.value as LxInitiativePriority,
                                }))
                            }
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                        <Button onClick={addInitiative}>Save initiative</Button>
                    </div>
                )}

                <div className="mt-3 space-y-3">
                    {initiatives.length === 0 ? (
                        <p className="text-sm text-text-body">No initiatives yet.</p>
                    ) : (
                        initiatives.map((it) => {
                            const pr = PRIORITY_COLOR[it.priority] ?? PRIORITY_COLOR.MEDIUM;
                            const st = STATUS_COLOR[it.status] ?? STATUS_COLOR.ACTIVE;
                            return (
                                <div key={it.id} className="rounded-lg border border-border p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Target className="h-4 w-4 text-text-body" />
                                            <span className="font-medium">{it.title}</span>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <span
                                                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                                                style={{ background: pr.bg, color: pr.fg }}
                                            >
                                                {it.priority}
                                            </span>
                                            <span
                                                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                                                style={{ background: st.bg, color: st.fg }}
                                            >
                                                {it.status}
                                            </span>
                                        </div>
                                    </div>
                                    {it.description && (
                                        <p className="mt-1 text-sm text-text-body">
                                            {it.description}
                                        </p>
                                    )}
                                    <div className="mt-2">
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${Math.min(100, it.progress)}%`,
                                                    background: clan.color,
                                                }}
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-text-body">
                                            {it.progress}% ·{" "}
                                            {it.team.join(", ") || "No team assigned"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <EntityBlog
                kind="clan"
                id={clan.id}
                name={clan.name}
                canPost={
                    can(PERMISSIONS.MANAGE_CLANS) ||
                    (actor?.clanId === clan.id && can(PERMISSIONS.MANAGE_CLAN_INITIATIVES))
                }
            />
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-text-body">{label}</p>
            <p className="mt-1 text-sm font-semibold">{value}</p>
        </div>
    );
}
