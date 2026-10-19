import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The seven tones every badge in the module is allowed to use.
 *
 * Before this existed, roughly a dozen files each carried their own
 * `Record<Status, { bg: string; fg: string }>` of raw hex, which meant the same
 * "approved" green was written five different ways, none of them from the brand
 * guide, and none of them able to follow a theme. A tone is a brand role, not a
 * colour: pick the role and the tokens decide what it looks like in light and
 * in dark.
 *
 * `neutral` is deliberately last-resort. If a value has no status meaning — a
 * category, a type, a label — it should usually be neutral rather than borrow a
 * status colour that implies something is wrong or finished.
 */
export type BadgeTone =
    "neutral" | "primary" | "secondary" | "info" | "success" | "warning" | "error";

const TONE: Record<BadgeTone, { surface: string; dot: string }> = {
    neutral: { surface: "bg-muted text-text-subheading", dot: "bg-icon-secondary" },
    primary: {
        surface: "bg-primary-subtle text-primary-subtle-foreground",
        dot: "bg-primary",
    },
    secondary: {
        surface: "bg-secondary-subtle text-secondary-subtle-foreground",
        dot: "bg-secondary",
    },
    info: { surface: "bg-info-subtle text-info-subtle-foreground", dot: "bg-info-dot" },
    success: {
        surface: "bg-success-subtle text-success-subtle-foreground",
        dot: "bg-success-dot",
    },
    warning: {
        surface: "bg-warning-subtle text-warning-subtle-foreground",
        dot: "bg-warning-dot",
    },
    error: { surface: "bg-error-subtle text-error-subtle-foreground", dot: "bg-error-dot" },
};

type BadgeProps = {
    tone?: BadgeTone;
    /** Show the leading status dot. Off by default — a dot on a plain category
     *  label reads as a live status indicator when it is not one. */
    dot?: boolean;
    className?: string;
    children: ReactNode;
};

export function Badge({ tone = "neutral", dot = false, className, children }: BadgeProps) {
    const t = TONE[tone] ?? TONE.neutral;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                t.surface,
                className,
            )}
        >
            {dot && <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", t.dot)} />}
            {children}
        </span>
    );
}

/**
 * Tone for the approval lifecycle shared by events, expenses, products,
 * achievements, reimbursements and lost-and-found posts. They all use the same
 * three or four words, so they should all look the same.
 */
export function approvalTone(status: string): BadgeTone {
    switch (status) {
        case "APPROVED":
        case "ACTIVE":
        case "PAID":
        case "RESOLVED_APPROVED":
            return "success";
        case "PENDING":
        case "SUBMITTED":
        case "UNDER_REVIEW":
            return "warning";
        case "REJECTED":
        case "FAILED":
            return "error";
        // "Cancelled" is switched off, not failed, so it stays neutral — the
        // same distinction the hand-written maps drew before this existed.
        case "CANCELLED":
        case "COMPLETED":
        case "RESOLVED":
        case "CLOSED":
            return "neutral";
        default:
            return "neutral";
    }
}
