import type { LxClubCategory } from "@/features/lx/club/types";
import type { BadgeTone } from "@/components/ui/badge";

/**
 * Label and badge tone for each club category.
 *
 * Categories carry no status meaning, so the only requirement is that no two
 * are the same colour. The brand offers five usable hues plus neutral, and
 * there are exactly six categories, so each gets its own. Previously this held
 * raw hex from a palette that is not ours (indigo, pink, slate), which also
 * meant the badges stayed light-themed on a dark page.
 */
/*
 * Every category is neutral.
 *
 * These were one tone each — blue, pink, green, orange, yellow — which turned a
 * grid of club cards into a colour chart. A category is not a status: nothing
 * about "Cultural" is a warning or a success, so colouring it says something
 * the data does not. The word carries the meaning; the dot keeps the rows
 * scannable without the page shouting.
 */
export const CATEGORY_META: Record<LxClubCategory, { label: string; tone: BadgeTone }> = {
    TECHNICAL: { label: "Technical", tone: "neutral" },
    CULTURAL: { label: "Cultural", tone: "neutral" },
    SPORTS: { label: "Sports", tone: "neutral" },
    SOCIAL: { label: "Social", tone: "neutral" },
    ACADEMIC: { label: "Academic", tone: "neutral" },
    OTHER: { label: "Other", tone: "neutral" },
};

export const CATEGORY_OPTIONS: { value: LxClubCategory; label: string }[] = (
    Object.keys(CATEGORY_META) as LxClubCategory[]
).map((value) => ({ value, label: CATEGORY_META[value].label }));

export const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value || 0);
