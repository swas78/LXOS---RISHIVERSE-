// Money formatting for LX.
//
// Budget figures are SCOPED by the backend (helper/lxScope.js): a club head
// sees their own club's spend, an admin sees everyone's, and everyone else
// receives `null` alongside `budgetVisible: false`.
//
// `null` means "you may not see this" — it is NOT zero. Rendering ₹0 there
// would assert that an entity spent nothing, which is a different and false
// claim. Always route scoped figures through `scopedInr`.

export const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

/** Placeholder shown in place of a figure this actor may not read. */
export const HIDDEN = "—";

/** Format a possibly-hidden money figure. `null`/`undefined` render as an em dash. */
export const scopedInr = (value: number | null | undefined): string =>
    value == null ? HIDDEN : inr.format(value);

/** Format a possibly-hidden plain number (no currency symbol). */
export const scopedNum = (value: number | null | undefined): string =>
    value == null ? HIDDEN : value.toLocaleString("en-IN");

/**
 * Percentage utilisation, or `null` when either side is hidden.
 * Callers render `null` as {@link HIDDEN} rather than 0%.
 */
export const utilisation = (
    spent: number | null | undefined,
    allocated: number | null | undefined,
): number | null => {
    if (spent == null || allocated == null || allocated <= 0) return null;
    return Math.round((spent / allocated) * 100);
};
