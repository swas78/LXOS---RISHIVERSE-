"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
    createLostFoundThunk,
    deleteLostFoundThunk,
    fetchLostFoundThunk,
    resolveLostFoundThunk,
    reviewLostFoundThunk,
} from "@/features/lx/lostFound/lostFoundThunks";
import {
    selectLostFoundCounts,
    selectLostFoundError,
    selectLostFoundItems,
    selectLostFoundLoading,
    selectLostFoundTotal,
} from "@/features/lx/lostFound/lostFoundSelectors";
import type {
    CreateLxLostFoundPayload,
    LxLostFoundCategory,
    LxLostFoundItem,
    LxLostFoundKind,
    LxLostFoundScope,
} from "@/features/lx/lostFound/types";
import { LostFoundCard } from "./components/LostFoundCard";
import { ReportItemForm } from "./components/ReportItemForm";
import { useCan } from "@/hooks/useCan";
import { PERMISSIONS } from "@/lib/permissions";

const CATEGORIES: { value: LxLostFoundCategory; label: string }[] = [
    { value: "ELECTRONICS", label: "Electronics" },
    { value: "ID_CARD", label: "ID card" },
    { value: "KEYS", label: "Keys" },
    { value: "WALLET", label: "Wallet" },
    { value: "CLOTHING", label: "Clothing" },
    { value: "BOOK", label: "Book" },
    { value: "STATIONERY", label: "Stationery" },
    { value: "ACCESSORY", label: "Accessory" },
    { value: "OTHER", label: "Other" },
];

const EMPTY_COPY: Record<LxLostFoundScope, string> = {
    BOARD: "Nothing on the board right now. If you have lost or found something, report it.",
    PENDING: "Nothing waiting for review.",
    MINE: "You have not reported anything yet.",
    RESOLVED: "Nothing has been returned yet.",
};

export default function LostFoundPage() {
    const { can } = useCan();
    const canApprove = can(PERMISSIONS.APPROVE_LOST_FOUND);

    const dispatch = useAppDispatch();
    const items = useAppSelector(selectLostFoundItems);
    const counts = useAppSelector(selectLostFoundCounts);
    const loading = useAppSelector(selectLostFoundLoading);
    const error = useAppSelector(selectLostFoundError);
    const total = useAppSelector(selectLostFoundTotal);

    const [scope, setScope] = useState<LxLostFoundScope>("BOARD");
    const [search, setSearch] = useState("");
    const [kind, setKind] = useState<LxLostFoundKind | "">("");
    const [category, setCategory] = useState<LxLostFoundCategory | "">("");
    const [open, setOpen] = useState(false);

    const debouncedSearch = useDebouncedValue(search, 300);

    const load = useCallback(() => {
        // The thunk carries an AbortSignal, so a fast typist's superseded requests
        // are cancelled rather than racing each other into the store.
        const promise = dispatch(
            fetchLostFoundThunk({
                scope,
                search: debouncedSearch || undefined,
                kind: kind || undefined,
                category: category || undefined,
                limit: 24,
            }),
        );
        return () => promise.abort();
    }, [dispatch, scope, debouncedSearch, kind, category]);

    useEffect(() => load(), [load]);

    const submit = async (payload: CreateLxLostFoundPayload) => {
        const result = await dispatch(createLostFoundThunk(payload));
        if (createLostFoundThunk.rejected.match(result)) return false;
        // A new report is pending, so it will not show on the board — send the
        // author to "My reports" where they can actually see it.
        setScope("MINE");
        return true;
    };

    const review = (id: string, action: "approve" | "reject") => {
        const rejectionReason =
            action === "reject"
                ? (window.prompt("Why is this being rejected? The reporter will see this.") ??
                  undefined)
                : undefined;
        void dispatch(reviewLostFoundThunk({ id, action, rejectionReason })).then(() => load());
    };

    const resolve = (item: LxLostFoundItem) => {
        const note = window.prompt("Any note about how it was returned? (optional)") ?? undefined;
        void dispatch(resolveLostFoundThunk({ id: item.id, resolutionNote: note })).then(() =>
            load(),
        );
    };

    const remove = (item: LxLostFoundItem) => {
        if (!window.confirm(`Remove your report "${item.title}"?`)) return;
        void dispatch(deleteLostFoundThunk(item.id)).then(() => load());
    };

    const tabs: { value: LxLostFoundScope; label: string; badge?: number; show: boolean }[] = [
        { value: "BOARD", label: "Noticeboard", badge: counts.APPROVED, show: true },
        {
            value: "PENDING",
            label: "Awaiting approval",
            badge: counts.PENDING,
            show: canApprove,
        },
        { value: "MINE", label: "My reports", show: true },
        { value: "RESOLVED", label: "Returned", badge: counts.RESOLVED, show: true },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary-text">Lost &amp; Found</h1>
                    <p className="mt-1 text-sm text-text-body">
                        Misplaced something on campus, or picked something up? Post it here — an
                        admin checks every report before it goes live.
                    </p>
                </div>
                <Button className="shrink-0 gap-1.5" onClick={() => setOpen(true)}>
                    <Plus className="h-4 w-4" /> Report an item
                </Button>
            </div>

            <div className="flex flex-wrap gap-2">
                {tabs
                    .filter((t) => t.show)
                    .map((t) => (
                        <button
                            key={t.value}
                            onClick={() => setScope(t.value)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                                scope === t.value
                                    ? "bg-primary text-primary-foreground"
                                    : "border border-border text-text-body hover:bg-subtle"
                            }`}
                        >
                            {t.label}
                            {t.badge !== undefined && t.badge > 0 && (
                                <span
                                    className={`rounded-full px-1.5 text-[11px] ${
                                        scope === t.value ? "bg-card/25" : "bg-muted text-text-body"
                                    }`}
                                >
                                    {t.badge}
                                </span>
                            )}
                        </button>
                    ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-body" />
                        <input
                            className="w-full rounded-card border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-border-focus"
                            placeholder="Search by item, description or place…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="rounded-card border border-border bg-card px-3 py-2 text-sm outline-none focus:border-border-focus"
                        value={kind}
                        onChange={(e) => setKind(e.target.value as LxLostFoundKind | "")}
                    >
                        <option value="">Lost &amp; found</option>
                        <option value="LOST">Lost only</option>
                        <option value="FOUND">Found only</option>
                    </select>
                    <select
                        className="rounded-card border border-border bg-card px-3 py-2 text-sm outline-none focus:border-border-focus"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as LxLostFoundCategory | "")}
                    >
                        <option value="">All categories</option>
                        {CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </div>
                <span className="text-sm text-text-body">{total} items</span>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            {loading && items.length === 0 ? (
                <p className="text-sm text-text-body">Loading…</p>
            ) : items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-10 text-center">
                    <p className="text-sm text-text-body">{EMPTY_COPY[scope]}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <LostFoundCard
                            key={item.id}
                            item={item}
                            // The public board shows only approved items, so a status chip
                            // there would have one possible value and tell nobody anything.
                            showStatus={scope !== "BOARD"}
                            canReview={canApprove && scope === "PENDING"}
                            onReview={review}
                            onResolve={resolve}
                            onDelete={remove}
                        />
                    ))}
                </div>
            )}

            {open && <ReportItemForm onClose={() => setOpen(false)} onSubmit={submit} />}
        </div>
    );
}
