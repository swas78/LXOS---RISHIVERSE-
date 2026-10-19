"use client";

import { useEffect } from "react";
import { Award, Megaphone } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchFeedThunk } from "@/features/lx/feed/feedThunks";
import { formatDate } from "../events/utils/format";

const CATEGORY_COLOR: Record<string, { bg: string; fg: string }> = {
    ACADEMIC: { bg: "var(--info-subtle)", fg: "var(--info-subtle-foreground)" },
    SPORTS: { bg: "var(--success-subtle)", fg: "var(--success-subtle-foreground)" },
    CULTURAL: { bg: "var(--secondary-subtle)", fg: "var(--secondary-subtle-foreground)" },
    TECHNICAL: { bg: "var(--secondary-subtle)", fg: "var(--secondary-subtle-foreground)" },
    SOCIAL: { bg: "var(--warning-subtle)", fg: "var(--warning-subtle-foreground)" },
    OTHER: { bg: "var(--muted)", fg: "var(--text-subheading)" },
};

export default function FeedPage() {
    const dispatch = useAppDispatch();
    const items = useAppSelector((s) => s.lxFeed.items);
    const loading = useAppSelector((s) => s.lxFeed.loading);

    useEffect(() => {
        void dispatch(fetchFeedThunk(undefined));
    }, [dispatch]);

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-primary-text">Activity Feed</h1>
                <p className="mt-1 text-sm text-text-body">
                    A live stream of approved achievements and club updates across campus.
                </p>
            </div>

            {loading && items.length === 0 ? (
                <p className="text-sm text-text-body">Loading feed…</p>
            ) : items.length === 0 ? (
                <p className="text-sm text-text-body">Nothing on the feed yet.</p>
            ) : (
                <div className="space-y-4">
                    {items.map((a) => {
                        const isUpdate = a.kind === "UPDATE";
                        const cat = CATEGORY_COLOR[a.category] ?? CATEGORY_COLOR.OTHER;
                        const tag = a.clubName || a.clanName || "Campus";
                        return (
                            <div
                                key={a.id}
                                className="rounded-2xl border border-border-subtle bg-card p-5 shadow-xs"
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                                        style={{ background: cat.bg, color: cat.fg }}
                                    >
                                        {isUpdate ? (
                                            <Megaphone className="h-4 w-4" />
                                        ) : (
                                            <Award className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold">{a.title}</span>
                                            {!isUpdate && (
                                                <span
                                                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                                                    style={{ background: cat.bg, color: cat.fg }}
                                                >
                                                    {a.category}
                                                </span>
                                            )}
                                            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-text-body">
                                                {tag}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-text-body">
                                            {a.description}
                                        </p>
                                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-body">
                                            <span>{a.createdByName}</span>
                                            <span>·</span>
                                            <span>{formatDate(a.achievedDate)}</span>
                                            {a.participants.length > 0 && (
                                                <>
                                                    <span>·</span>
                                                    <span>{a.participants.join(", ")}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
