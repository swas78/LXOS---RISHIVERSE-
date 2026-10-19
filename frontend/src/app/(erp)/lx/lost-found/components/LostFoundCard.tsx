"use client";

import { useState } from "react";
import { Check, CheckCircle2, ImageOff, MapPin, Phone, Trash2, X } from "lucide-react";
import { s3PathToUrl } from "@/features/upload/uploadApi";
import type { LxLostFoundItem } from "@/features/lx/lostFound/types";

const CATEGORY_LABEL: Record<string, string> = {
    ELECTRONICS: "Electronics",
    ID_CARD: "ID card",
    KEYS: "Keys",
    WALLET: "Wallet",
    CLOTHING: "Clothing",
    BOOK: "Book",
    STATIONERY: "Stationery",
    ACCESSORY: "Accessory",
    OTHER: "Other",
};

const STATUS_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
    PENDING: {
        bg: "var(--warning-subtle)",
        fg: "var(--warning-subtle-foreground)",
        label: "Awaiting approval",
    },
    APPROVED: {
        bg: "var(--success-subtle)",
        fg: "var(--success-subtle-foreground)",
        label: "Live",
    },
    REJECTED: {
        bg: "var(--error-subtle)",
        fg: "var(--error-subtle-foreground)",
        label: "Rejected",
    },
    RESOLVED: { bg: "var(--muted)", fg: "var(--text-subheading)", label: "Returned" },
};

const dateLabel = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        timeZone: "Asia/Kolkata",
    });

type Props = {
    item: LxLostFoundItem;
    /** Show the moderation status chip — off on the public board. */
    showStatus?: boolean;
    canReview?: boolean;
    onReview?: (id: string, action: "approve" | "reject") => void;
    onResolve?: (item: LxLostFoundItem) => void;
    onDelete?: (item: LxLostFoundItem) => void;
};

export function LostFoundCard({
    item,
    showStatus,
    canReview,
    onReview,
    onResolve,
    onDelete,
}: Props) {
    const st = STATUS_STYLE[item.status] ?? STATUS_STYLE.PENDING;
    const isLost = item.kind === "LOST";
    // A stored pointer can outlive its object — the bucket lifecycle-expires it,
    // or a signed URL 404s. Fall back to the placeholder rather than leaving a
    // broken-image icon sitting in the card.
    const [imageBroken, setImageBroken] = useState(false);
    const cover = imageBroken ? null : s3PathToUrl(item.images[0]);

    return (
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-card transition hover:shadow-md">
            <div className="relative h-40 w-full bg-muted">
                {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={cover}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        onError={() => setImageBroken(true)}
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-1 text-xs text-text-body">
                        <ImageOff className="h-5 w-5" />
                        No photo
                    </div>
                )}

                {/* Lost vs found is the single most important thing about the post, so
            it is the one badge that is always visible. */}
                <span
                    className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={
                        isLost
                            ? {
                                  background: "var(--error-subtle)",
                                  color: "var(--error-subtle-foreground)",
                              }
                            : {
                                  background: "var(--info-subtle)",
                                  color: "var(--info-subtle-foreground)",
                              }
                    }
                >
                    {isLost ? "Lost" : "Found"}
                </span>

                {showStatus && (
                    <span
                        className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{ background: st.bg, color: st.fg }}
                    >
                        {st.label}
                    </span>
                )}

                {item.images.length > 1 && (
                    <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                        +{item.images.length - 1} more
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-tight">{item.title}</h3>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-text-body">
                        {CATEGORY_LABEL[item.category] ?? item.category}
                    </span>
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-text-body">{item.description}</p>

                <div className="mt-3 space-y-1 text-xs text-text-body">
                    <p className="flex items-start gap-1.5">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {item.location} · {dateLabel(item.occurredOn)}
                    </p>
                    {item.contactPhone && (
                        <p className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <a
                                href={`tel:${item.contactPhone}`}
                                className="text-primary hover:underline"
                            >
                                {item.contactPhone}
                            </a>
                        </p>
                    )}
                </div>

                <p className="mt-2 text-[11px] text-text-body">
                    Reported by {item.reportedByName ?? item.reportedByRef}
                </p>

                {item.status === "REJECTED" && item.rejectionReason && (
                    <p className="mt-2 rounded bg-error-subtle px-2 py-1 text-[11px] text-error">
                        Rejected: {item.rejectionReason}
                    </p>
                )}

                {item.status === "RESOLVED" && (
                    <p className="mt-2 rounded bg-subtle px-2 py-1 text-[11px] text-text-body">
                        Returned{item.resolutionNote ? ` — ${item.resolutionNote}` : ""}
                    </p>
                )}

                {(canReview || item.canResolve || item.isMine) && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                        {canReview && item.status === "PENDING" && (
                            <>
                                <button
                                    onClick={() => onReview?.(item.id, "approve")}
                                    className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2 py-1 text-xs font-medium text-success-subtle-foreground hover:bg-success-subtle/70"
                                >
                                    <Check className="h-3.5 w-3.5" /> Approve
                                </button>
                                <button
                                    onClick={() => onReview?.(item.id, "reject")}
                                    className="inline-flex items-center gap-1 rounded-full bg-error-subtle px-2 py-1 text-xs font-medium text-error-subtle-foreground hover:bg-error-subtle/70"
                                >
                                    <X className="h-3.5 w-3.5" /> Reject
                                </button>
                            </>
                        )}

                        {item.canResolve && item.status === "APPROVED" && (
                            <button
                                onClick={() => onResolve?.(item)}
                                className="inline-flex items-center gap-1 rounded-card border border-border px-2 py-1 text-xs font-medium hover:bg-subtle"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Mark returned
                            </button>
                        )}

                        {item.isMine && item.status !== "RESOLVED" && (
                            <button
                                onClick={() => onDelete?.(item)}
                                className="ml-auto inline-flex items-center gap-1 rounded-card p-1 text-text-body hover:bg-error-subtle hover:text-error"
                                title="Remove my report"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
