"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Award, Check, Plus, Search, X } from "lucide-react";
import { Button, SheetCancelButton, SheetSubmitButton } from "@/components/ui/button";
import { useAchievements } from "./hooks/useAchievements";
import { FilterDropdown } from "@/components/ui/filters";
import type {
    CreateLxAchievementPayload,
    LxAchievementCategory,
} from "@/features/lx/achievement/types";
import { useCan } from "@/hooks/useCan";
import { PERMISSIONS } from "@/lib/permissions";

const CATEGORIES: LxAchievementCategory[] = [
    "ACADEMIC",
    "SPORTS",
    "CULTURAL",
    "TECHNICAL",
    "SOCIAL",
    "OTHER",
];

const CAT_COLOR: Record<string, { bg: string; fg: string }> = {
    // Category is not a status. Colouring it made a wall of achievement cards
    // read as a colour chart, with "Sports" green as though it were a success
    // and "Social" amber as though it were a warning. The word does the work.
    ACADEMIC: { bg: "var(--muted)", fg: "var(--text-subheading)" },
    SPORTS: { bg: "var(--muted)", fg: "var(--text-subheading)" },
    CULTURAL: { bg: "var(--muted)", fg: "var(--text-subheading)" },
    TECHNICAL: { bg: "var(--muted)", fg: "var(--text-subheading)" },
    SOCIAL: { bg: "var(--muted)", fg: "var(--text-subheading)" },
    OTHER: { bg: "var(--muted)", fg: "var(--text-subheading)" },
};

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
    PENDING: { bg: "var(--warning-subtle)", fg: "var(--warning-subtle-foreground)" },
    APPROVED: { bg: "var(--success-subtle)", fg: "var(--success-subtle-foreground)" },
    REJECTED: { bg: "var(--error-subtle)", fg: "var(--error-subtle-foreground)" },
};

export default function AchievementsPage() {
    const { can } = useCan();
    const canCreate = can(PERMISSIONS.CREATE_ACHIEVEMENT);
    const canReview = can(PERMISSIONS.APPROVE_ACHIEVEMENT);
    const {
        achievements,
        loading,
        error,
        clubs,
        clans,
        personChips,
        search,
        setSearch,
        person,
        setPerson,
        category,
        setCategory,
        status,
        setStatus,
        createAchievement,
        reviewAchievement,
    } = useAchievements();

    const [open, setOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary-text">Achievements</h1>
                    <p className="mt-1 text-sm text-text-body">
                        Every win — searchable by person, recorded, and celebrated on the feed.
                    </p>
                </div>
                {canCreate && (
                    <Button className="shrink-0 gap-1.5" onClick={() => setOpen(true)}>
                        <Plus className="h-4 w-4" /> Add Achievement
                    </Button>
                )}
            </div>

            {/* Search + filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-body" />
                    <input
                        className="w-full rounded-card border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-border-focus"
                        placeholder="Search by person, title, club…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <FilterDropdown
                    label="Category"
                    value={category}
                    onChange={(v) => setCategory(v as LxAchievementCategory | "")}
                    options={[
                        { value: "", label: "All" },
                        ...CATEGORIES.map((c) => ({ value: c, label: c })),
                    ]}
                />
                <FilterDropdown
                    label="Status"
                    value={status}
                    onChange={(v) => setStatus(v as "PENDING" | "APPROVED" | "REJECTED" | "")}
                    options={[
                        { value: "", label: "All" },
                        { value: "PENDING", label: "Pending" },
                        { value: "APPROVED", label: "Approved" },
                        { value: "REJECTED", label: "Rejected" },
                    ]}
                />
            </div>

            {/*
             * Person was a row of chips — one per contributor, wrapping onto a
             * second line once a dozen people had posted, and pushing the
             * content down the page. It is a filter like any other, so it is
             * one dropdown that names who is selected.
             */}
            {personChips.length > 0 && (
                <FilterDropdown
                    label="Person"
                    value={person}
                    onChange={setPerson}
                    options={[
                        { value: "", label: "Everyone" },
                        ...personChips.map((p) => ({
                            value: p.name,
                            label: `${p.name} (${p.count})`,
                        })),
                    ]}
                    className="w-fit"
                />
            )}

            {error && <p className="text-sm text-error">{error}</p>}

            {loading && achievements.length === 0 ? (
                <p className="text-sm text-text-body">Loading achievements…</p>
            ) : achievements.length === 0 ? (
                <p className="text-sm text-text-body">No achievements match your filters.</p>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {achievements.map((a) => {
                        const cat = CAT_COLOR[a.category] ?? CAT_COLOR.OTHER;
                        const st = STATUS_STYLE[a.status] ?? STATUS_STYLE.PENDING;
                        return (
                            <div
                                key={a.id}
                                className="flex flex-col rounded-2xl border border-border-subtle bg-card p-5 shadow-xs"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div
                                        className="flex h-9 w-9 items-center justify-center rounded-lg"
                                        style={{ background: cat.bg, color: cat.fg }}
                                    >
                                        <Award className="h-5 w-5" />
                                    </div>
                                    <span
                                        className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                                        style={{ background: st.bg, color: st.fg }}
                                    >
                                        {a.status}
                                    </span>
                                </div>
                                <h3 className="mt-3 font-semibold leading-tight">{a.title}</h3>
                                <p className="mt-1 line-clamp-2 text-sm text-text-body">
                                    {a.description}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    <span
                                        className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                                        style={{ background: cat.bg, color: cat.fg }}
                                    >
                                        {a.category}
                                    </span>
                                    {(a.clubName || a.clanName) && (
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-text-body">
                                            {a.clubName || a.clanName}
                                        </span>
                                    )}
                                    {a.points > 0 && (
                                        <span className="rounded-full bg-brand-subtle px-2 py-0.5 text-[11px] font-medium text-brand-subtle-foreground">
                                            +{a.points} pts
                                        </span>
                                    )}
                                </div>
                                <p className="mt-2 text-xs text-text-body">
                                    By {a.createdByName}
                                    {a.participants.length ? ` · ${a.participants.join(", ")}` : ""}
                                </p>

                                {canReview && a.status === "PENDING" && (
                                    <div className="mt-3 flex gap-2 border-t border-border pt-3">
                                        <button
                                            onClick={() =>
                                                reviewAchievement(a.id, { action: "approve" })
                                            }
                                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-success-subtle px-2 py-1.5 text-xs font-medium text-success-subtle-foreground hover:bg-success-subtle/70"
                                        >
                                            <Check className="h-3.5 w-3.5" /> Approve
                                        </button>
                                        <button
                                            onClick={() =>
                                                reviewAchievement(a.id, {
                                                    action: "reject",
                                                    rejectionReason:
                                                        window.prompt("Reason?") ?? undefined,
                                                })
                                            }
                                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-error-subtle px-2 py-1.5 text-xs font-medium text-error-subtle-foreground hover:bg-error-subtle/70"
                                        >
                                            <X className="h-3.5 w-3.5" /> Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {open && (
                <AddAchievementModal
                    clubs={clubs}
                    clans={clans}
                    onClose={() => setOpen(false)}
                    onCreate={createAchievement}
                />
            )}
        </div>
    );
}

function AddAchievementModal({
    clubs,
    clans,
    onClose,
    onCreate,
}: {
    clubs: { id: string; name: string }[];
    clans: { id: string; name: string }[];
    onClose: () => void;
    onCreate: (p: CreateLxAchievementPayload) => Promise<boolean>;
}) {
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "OTHER" as LxAchievementCategory,
        achievedDate: "",
        participants: "",
        clubId: "",
        clanId: "",
    });
    const field =
        "w-full rounded-input border border-input bg-card px-3 py-2 text-sm text-text-heading outline-none transition-colors placeholder:text-text-placeholder focus:border-border-focus";

    const submit = async () => {
        if (!form.title.trim() || !form.description.trim()) return;
        const club = clubs.find((c) => c.id === form.clubId);
        const clan = clans.find((c) => c.id === form.clanId);
        const ok = await onCreate({
            title: form.title.trim(),
            description: form.description.trim(),
            category: form.category,
            achievedDate: form.achievedDate ? new Date(form.achievedDate).toISOString() : undefined,
            participants: form.participants
                ? form.participants
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                : [],
            clubId: form.clubId || null,
            clubName: club?.name ?? null,
            clanId: form.clanId || null,
            clanName: clan?.name ?? null,
        });
        if (ok) onClose();
    };

    return (
        <Sheet
            open
            onClose={onClose}
            title="Add Achievement"
            footer={
                <>
                    <SheetCancelButton onClick={onClose}>Cancel</SheetCancelButton>
                    <SheetSubmitButton onClick={submit}>Submit</SheetSubmitButton>
                </>
            }
        >
            <div className="space-y-3">
                <input
                    className={field}
                    placeholder="Title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
                <textarea
                    className={field}
                    rows={2}
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-3">
                    <select
                        className={field}
                        value={form.category}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                category: e.target.value as LxAchievementCategory,
                            }))
                        }
                    >
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        className={field}
                        value={form.achievedDate}
                        onChange={(e) => setForm((f) => ({ ...f, achievedDate: e.target.value }))}
                    />
                </div>
                <input
                    className={field}
                    placeholder="Participants (comma-separated)"
                    value={form.participants}
                    onChange={(e) => setForm((f) => ({ ...f, participants: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-3">
                    <select
                        className={field}
                        value={form.clubId}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, clubId: e.target.value, clanId: "" }))
                        }
                    >
                        <option value="">Link club (optional)</option>
                        {clubs.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <select
                        className={field}
                        value={form.clanId}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, clanId: e.target.value, clubId: "" }))
                        }
                    >
                        <option value="">Link clan (optional)</option>
                        {clans.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </Sheet>
    );
}
