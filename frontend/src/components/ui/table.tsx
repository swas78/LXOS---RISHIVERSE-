"use client";

import type { ReactNode, ThHTMLAttributes } from "react";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    ChevronUp,
    LayoutGrid,
    Table as TableIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The list furniture from the RishiVerse widget guide: the round icon toolbar
 * above a table, sortable column headers, and the "Showing X to Y of Z" footer.
 *
 * LX had none of this. Its tables were bare — no sort affordance, no toolbar,
 * and a bare "Prev / Next" pair with no sense of where you were. The guide's
 * versions are not decoration: the sort chevrons are the only clue a column
 * can be ordered at all, and "Showing 1 to 10 of 50" is what tells you the
 * list continues past what you can see.
 */

/* ---------------------------------------------------------------- toolbar */

/**
 * A round outline icon button, ~40px, as used for filter / search / export /
 * columns above the guide's tables.
 */
export function ToolbarButton({
    icon: Icon,
    label,
    active = false,
    onClick,
    disabled,
}: {
    icon: typeof ChevronDown;
    /** Required: these buttons are icon-only, so the name lives here. */
    label: string;
    active?: boolean;
    onClick?: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={label}
            aria-label={label}
            aria-pressed={active}
            className={cn(
                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                "disabled:pointer-events-none disabled:opacity-50",
                active
                    ? "border-transparent bg-muted text-text-heading"
                    : "border-border text-icon-secondary hover:bg-subtle hover:text-icon-primary",
            )}
        >
            <Icon className="h-4 w-4" />
        </button>
    );
}

export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("flex flex-wrap items-center justify-end gap-2", className)}>
            {children}
        </div>
    );
}

/** The thin rule the guide puts between tool groups and the view switch. */
export function ToolbarDivider() {
    return <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-border" />;
}

/* ------------------------------------------------------------------ table */

export function Table({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("overflow-hidden rounded-card border border-border bg-card", className)}>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">{children}</table>
            </div>
        </div>
    );
}

export type SortDir = "asc" | "desc";

/**
 * A column header that can be sorted.
 *
 * Shows a neutral up/down glyph until the column is the active one, then the
 * single arrow for the direction — so at a glance you can tell which column
 * the list is ordered by, which the neutral glyph alone cannot do.
 */
export function SortableTh({
    children,
    sortKey,
    activeKey,
    dir,
    onSort,
    className,
    ...props
}: {
    children: ReactNode;
    sortKey: string;
    activeKey?: string | null;
    dir?: SortDir;
    onSort?: (key: string) => void;
} & ThHTMLAttributes<HTMLTableCellElement>) {
    const active = activeKey === sortKey;
    const sortable = typeof onSort === "function";
    return (
        <th
            scope="col"
            aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
            className={cn(
                "border-b border-border px-4 py-3 text-xs font-medium whitespace-nowrap text-text-subheading",
                className,
            )}
            {...props}
        >
            {sortable ? (
                <button
                    type="button"
                    onClick={() => onSort(sortKey)}
                    className="inline-flex items-center gap-1.5 rounded transition-colors hover:text-text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                    {children}
                    {active ? (
                        dir === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5 text-text-heading" />
                        ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-text-heading" />
                        )
                    ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 text-icon-disabled" />
                    )}
                </button>
            ) : (
                children
            )}
        </th>
    );
}

/* ------------------------------------------------------------- pagination */

/**
 * The guide's footer: a plain-English count on the left, page position and
 * arrows on the right.
 */
export function Pagination({
    page,
    totalPages,
    totalCount,
    limit,
    onPage,
    noun = "entries",
    className,
}: {
    page: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    onPage: (page: number) => void;
    noun?: string;
    className?: string;
}) {
    if (totalCount === 0) return null;
    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, totalCount);

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-between gap-3 sm:flex-row",
                className,
            )}
        >
            <p className="text-sm text-text-body">
                Showing {from} to {to} of {totalCount} {noun}
            </p>

            <div className="flex items-center gap-2 text-sm">
                <span className="text-text-body">Page</span>
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-input border border-border px-2 font-medium text-text-heading">
                    {page}
                </span>
                <span className="text-text-body">of {Math.max(totalPages, 1)}</span>

                <button
                    type="button"
                    onClick={() => onPage(page - 1)}
                    disabled={page <= 1}
                    aria-label="Previous page"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-icon-secondary transition-colors hover:bg-ghost-hover hover:text-icon-primary disabled:pointer-events-none disabled:opacity-40"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => onPage(page + 1)}
                    disabled={page >= totalPages}
                    aria-label="Next page"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-icon-secondary transition-colors hover:bg-ghost-hover hover:text-icon-primary disabled:pointer-events-none disabled:opacity-40"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

/* --------------------------------------------------------- view switcher */

/**
 * The grid / table switch from the Gate Pass screens.
 *
 * Sits to the right of the tool buttons behind a thin divider, and the active
 * view is a filled pill rather than an outlined one — so which view you are in
 * is legible without hovering anything.
 */
export function ViewToggle({
    view,
    onChange,
}: {
    view: "grid" | "table";
    onChange: (v: "grid" | "table") => void;
}) {
    return (
        <div className="flex items-center gap-1">
            {(
                [
                    { id: "grid", icon: LayoutGrid, label: "Card view" },
                    { id: "table", icon: TableIcon, label: "Table view" },
                ] as const
            ).map(({ id, icon: Icon, label }) => (
                <button
                    key={id}
                    type="button"
                    onClick={() => onChange(id)}
                    title={label}
                    aria-label={label}
                    aria-pressed={view === id}
                    className={cn(
                        "inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        view === id
                            ? "bg-muted text-text-heading"
                            : "text-icon-secondary hover:bg-subtle hover:text-icon-primary",
                    )}
                >
                    <Icon className="h-4 w-4" />
                </button>
            ))}
        </div>
    );
}
