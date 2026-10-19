"use client";

import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Filter-bar controls.
 *
 * LX had four filter bars — clubs, events, files, rooms — each hand-rolling
 * its own search input and selects with slightly different classes. They all
 * predated the token work, so they still carried the old 6px radius and a
 * focus ring that pointed at the fill colour instead of the focus token. One
 * definition each, so a change lands everywhere at once.
 */

export function FilterBar({
    children,
    trailing,
    className,
}: {
    children: ReactNode;
    /** Right-hand side — usually the result count or a toolbar. */
    trailing?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
                className,
            )}
        >
            <div className="flex flex-1 flex-wrap items-center gap-2.5">{children}</div>
            {trailing && <div className="flex shrink-0 items-center gap-2">{trailing}</div>}
        </div>
    );
}

export function SearchInput({
    value,
    onChange,
    placeholder = "Search…",
    className,
    ...props
}: {
    value: string;
    onChange: (v: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
    return (
        <div className={cn("relative w-full sm:max-w-xs", className)}>
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-icon-secondary" />
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-9 w-full rounded-input border border-input bg-card pr-3 pl-9 text-sm text-text-heading outline-none transition-colors placeholder:text-text-placeholder focus:border-border-focus"
                {...props}
            />
        </div>
    );
}

export function FilterSelect({
    value,
    onChange,
    options,
    className,
    ...props
}: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange">) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
                "h-9 rounded-input border border-input bg-card px-3 text-sm text-text-heading outline-none transition-colors focus:border-border-focus",
                className,
            )}
            {...props}
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    );
}

/** The result count the guide puts opposite the filters. */
export function ResultCount({ count, noun }: { count: number; noun: string }) {
    return (
        <span className="text-sm whitespace-nowrap text-text-body">
            {count} {noun}
        </span>
    );
}

/**
 * A filter as Gate Pass renders it: a pill button reading "Status All" that
 * opens a small panel of choices.
 *
 * This replaces the native `<select>`. A native select paints the operating
 * system's own menu — grey on macOS, with its own focus ring — which is why
 * the filters still looked foreign after everything else had been restyled.
 * It cannot be themed, so it had to go.
 *
 * Closes on outside click and on Escape, and the trigger says what is
 * currently chosen rather than just naming the field.
 */
export function FilterDropdown({
    label,
    value,
    options,
    onChange,
    className,
}: {
    /** The field name, e.g. "Status". Shown with the current choice. */
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (v: string) => void;
    className?: string;
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const menuId = useId();

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const current = options.find((o) => o.value === value);

    return (
        <div ref={rootRef} className={cn("relative", className)}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-controls={open ? menuId : undefined}
                className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    open
                        ? "border-border-strong bg-card text-text-heading"
                        : "border-border bg-card text-text-subheading hover:bg-subtle",
                )}
            >
                <span className="whitespace-nowrap">
                    {label} {current?.label ?? "All"}
                </span>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 text-icon-secondary transition-transform",
                        open && "rotate-180",
                    )}
                />
            </button>

            {open && (
                <div
                    id={menuId}
                    role="listbox"
                    className="absolute top-full left-0 z-30 mt-2 min-w-[12rem] overflow-hidden rounded-2xl border border-border-subtle bg-popover py-1 shadow-lg"
                >
                    {options.map((o) => {
                        const selected = o.value === value;
                        return (
                            <button
                                key={o.value}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                onClick={() => {
                                    onChange(o.value);
                                    setOpen(false);
                                }}
                                className={cn(
                                    "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                                    selected
                                        ? "bg-subtle font-medium text-text-heading"
                                        : "text-text-subheading hover:bg-subtle",
                                )}
                            >
                                {o.label}
                                {selected && (
                                    <Check className="h-4 w-4 text-brand-subtle-foreground" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
