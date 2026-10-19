import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The summary tile from the RishiVerse widget guide.
 *
 * Three things differ from what LX had, and all three are deliberate in the
 * guide's version:
 *
 *   - The label sits ABOVE the number. You read "Pending", then "1" — which is
 *     the order the sentence actually goes in.
 *   - The tile is a flat tinted fill with no border and no shadow. A row of
 *     bordered white cards fights the table below it for attention; a row of
 *     soft tints reads as one band of summary.
 *   - No icon. The guide's tiles carry a word and a number, nothing else.
 *
 * The tone is what the number MEANS, not decoration: `neutral` for a plain
 * count, `warning` for things waiting, `success` for things finished.
 */
export type StatTone = "neutral" | "brand" | "info" | "success" | "warning" | "error";

const TONE: Record<StatTone, string> = {
    neutral: "bg-muted",
    // The peach brand tint, not the crimson one. `--primary` is crimson here,
    // so `primary-subtle` is pink — on a summary tile that reads as an error
    // rather than a neutral headline figure. The guide's tile is peach.
    brand: "bg-brand-subtle",
    info: "bg-info-subtle",
    success: "bg-success-subtle",
    warning: "bg-warning-subtle",
    error: "bg-error-subtle",
};

export function StatTile({
    label,
    value,
    tone = "neutral",
    hint,
    className,
}: {
    label: ReactNode;
    value: ReactNode;
    tone?: StatTone;
    /** Optional small line under the number, e.g. a comparison or unit. */
    hint?: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("rounded-2xl p-4 sm:p-5", TONE[tone], className)}>
            <p className="text-sm text-text-body">{label}</p>
            <p className="mt-1.5 text-2xl font-semibold text-text-heading sm:text-3xl">{value}</p>
            {hint && <p className="mt-1 text-xs text-text-body">{hint}</p>}
        </div>
    );
}

/** The usual 2-up / 4-up row the guide puts these in. */
export function StatTileRow({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4", className)}>
            {children}
        </div>
    );
}
