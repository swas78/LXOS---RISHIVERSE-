"use client";

import { useState } from "react";
import {
    Check,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Github,
    Star,
    Users,
    X,
} from "lucide-react";
import { s3PathToUrl } from "@/features/upload/uploadApi";
import type { LxProduct } from "@/features/lx/product/types";

const CATEGORY_META: Record<string, { label: string; bg: string; fg: string }> = {
    WEBSITE: { label: "Website", bg: "var(--muted)", fg: "var(--text-subheading)" },
    WEB_APP: {
        label: "Web App",
        bg: "var(--muted)",
        fg: "var(--text-subheading)",
    },
    MOBILE_APP: {
        label: "Mobile App",
        bg: "var(--muted)",
        fg: "var(--text-subheading)",
    },
    HARDWARE: {
        label: "Hardware",
        bg: "var(--muted)",
        fg: "var(--text-subheading)",
    },
    DESIGN: {
        label: "Design",
        bg: "var(--muted)",
        fg: "var(--text-subheading)",
    },
    RESEARCH: {
        label: "Research",
        bg: "var(--muted)",
        fg: "var(--text-subheading)",
    },
    GAME: { label: "Game", bg: "var(--muted)", fg: "var(--text-subheading)" },
    OTHER: { label: "Other", bg: "var(--muted)", fg: "var(--text-subheading)" },
};

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
    PENDING: { bg: "var(--warning-subtle)", fg: "var(--warning-subtle-foreground)" },
    APPROVED: { bg: "var(--success-subtle)", fg: "var(--success-subtle-foreground)" },
    REJECTED: { bg: "var(--error-subtle)", fg: "var(--error-subtle-foreground)" },
};

// Deterministic gradient for products with no image.
function gradientFor(seed: string) {
    let h = 0;
    for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) % 360;
    return `linear-gradient(135deg, hsl(${h} 70% 55%), hsl(${(h + 40) % 360} 70% 45%))`;
}

type Props = {
    product: LxProduct;
    showStatus?: boolean;
    canReview?: boolean;
    onReview?: (id: string, action: "approve" | "reject") => void;
};

export function ProductCard({ product, showStatus, canReview, onReview }: Props) {
    const cat = CATEGORY_META[product.category] ?? CATEGORY_META.OTHER;
    const st = STATUS_STYLE[product.status] ?? STATUS_STYLE.PENDING;
    // Index of the image open in the lightbox; null when it is closed.
    const [lightbox, setLightbox] = useState<number | null>(null);

    // Prefer the URLs the API resolved; fall back to deriving them so the card
    // still renders against an endpoint that only returned raw pointers.
    const shots = (product.images ?? [])
        .map((s3Path, i) => ({ s3Path, url: product.imageUrls?.[i] ?? s3PathToUrl(s3Path) }))
        .filter((s): s is { s3Path: string; url: string } => Boolean(s.url));

    const open = lightbox === null ? null : shots[lightbox];
    const step = (delta: number) =>
        setLightbox((i) => (i === null ? null : (i + delta + shots.length) % shots.length));

    return (
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-card transition hover:shadow-md">
            <div
                className="relative h-32 w-full"
                style={{ background: gradientFor(product.title) }}
            >
                {shots[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={shots[0].url}
                        alt={product.title}
                        onClick={() => setLightbox(0)}
                        className="h-full w-full cursor-zoom-in object-cover"
                    />
                )}
                {product.featured && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-[11px] font-semibold text-warning">
                        <Star className="h-3 w-3 fill-warning-dot text-warning-dot" /> Featured
                    </span>
                )}
                {showStatus && (
                    <span
                        className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{ background: st.bg, color: st.fg }}
                    >
                        {product.status}
                    </span>
                )}
            </div>

            {/* Mockups beyond the cover. Scrolls rather than wraps so a card keeps
          the same height whatever a learner uploaded. */}
            {shots.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto border-b border-border px-4 py-2">
                    {shots.slice(1).map((s, i) => (
                        <button
                            key={s.s3Path}
                            type="button"
                            onClick={() => setLightbox(i + 1)}
                            aria-label={`View image ${i + 2} of ${product.title}`}
                            className="h-10 w-14 shrink-0 overflow-hidden rounded border border-border"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={s.url} alt="" className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-tight">{product.title}</h3>
                    <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{ background: cat.bg, color: cat.fg }}
                    >
                        {cat.label}
                    </span>
                </div>
                {product.tagline && (
                    <p className="mt-0.5 text-xs text-text-body">{product.tagline}</p>
                )}
                <p className="mt-2 line-clamp-2 text-sm text-text-body">{product.description}</p>

                {product.techStack.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {product.techStack.slice(0, 5).map((t) => (
                            <span
                                key={t}
                                className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-text-body"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-3 flex items-center gap-1.5 text-xs text-text-body">
                    <Users className="h-3.5 w-3.5" />
                    {[product.createdByName, ...product.teamMembers]
                        .filter(Boolean)
                        .slice(0, 3)
                        .join(", ")}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                    {product.url && (
                        <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                            <ExternalLink className="h-3.5 w-3.5" /> Live
                        </a>
                    )}
                    {product.repoUrl && (
                        <a
                            href={product.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-text-body hover:underline"
                        >
                            <Github className="h-3.5 w-3.5" /> Code
                        </a>
                    )}

                    {canReview && product.status === "PENDING" && (
                        <div className="ml-auto flex gap-1.5">
                            <button
                                onClick={() => onReview?.(product.id, "approve")}
                                className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2 py-1 text-xs font-medium text-success-subtle-foreground hover:bg-success-subtle/70"
                            >
                                <Check className="h-3.5 w-3.5" /> Approve
                            </button>
                            <button
                                onClick={() => onReview?.(product.id, "reject")}
                                className="inline-flex items-center gap-1 rounded-full bg-error-subtle px-2 py-1 text-xs font-medium text-error-subtle-foreground hover:bg-error-subtle/70"
                            >
                                <X className="h-3.5 w-3.5" /> Reject
                            </button>
                        </div>
                    )}
                </div>

                {product.status === "REJECTED" && product.rejectionReason && (
                    <p className="mt-2 rounded bg-error-subtle px-2 py-1 text-[11px] text-error">
                        Rejected: {product.rejectionReason}
                    </p>
                )}
            </div>

            {open && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${product.title} images`}
                    onClick={() => setLightbox(null)}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") setLightbox(null);
                        if (e.key === "ArrowRight") step(1);
                        if (e.key === "ArrowLeft") step(-1);
                    }}
                    tabIndex={-1}
                    autoFocus /* so Esc / arrow keys land here without a click first */
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 outline-none"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={open.url}
                        alt={product.title}
                        onClick={(e) => e.stopPropagation()}
                        className="max-h-full max-w-full rounded-lg object-contain"
                    />
                    <button
                        type="button"
                        onClick={() => setLightbox(null)}
                        aria-label="Close"
                        className="absolute right-3 top-3 rounded-full bg-card/15 p-2 text-white hover:bg-card/25"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    {shots.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    step(-1);
                                }}
                                aria-label="Previous image"
                                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-card/15 p-2 text-white hover:bg-card/25"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    step(1);
                                }}
                                aria-label="Next image"
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-card/15 p-2 text-white hover:bg-card/25"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                            <span className="absolute bottom-4 rounded-full bg-card/15 px-2.5 py-1 text-xs text-white">
                                {(lightbox ?? 0) + 1} / {shots.length}
                            </span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
