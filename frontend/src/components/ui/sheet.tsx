"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The overlay RishiVerse actually uses, measured off the signed-in app.
 *
 * It is one responsive component, not two:
 *   - ≥640px: a right-hand side sheet, `ml-auto h-screen w-[520px]`.
 *   - <640px: a bottom sheet with a grab handle and rounded top corners.
 *
 * Chrome, from production: a 64px header with the title and an X at
 * `px-5`, a 1px `--border-subtle` rule under it, a scrolling body, and a
 * sticky footer whose two buttons split the width — Cancel (pill outline) and
 * the submit (peach pill).
 *
 * LX previously used centred `fixed inset-0` modals, which is not a pattern
 * this product has anywhere. Routing every overlay through this component is
 * what makes moving between LX and the rest of RishiVerse feel like one app.
 *
 * Behaviour the hand-rolled modals did not have: Escape closes, focus moves
 * into the panel on open and returns to the trigger on close, the background
 * cannot scroll, and the backdrop is inert to clicks that started inside the
 * panel (so a drag that ends on the backdrop does not dismiss a half-filled
 * form).
 */
type SheetProps = {
    open: boolean;
    onClose: () => void;
    title: ReactNode;
    /** Optional line under the title — production uses it for "All fields are required (*)". */
    description?: ReactNode;
    /** Sticky footer. Compose with SheetCancelButton / SheetSubmitButton. */
    footer?: ReactNode;
    children: ReactNode;
    className?: string;
};

export function Sheet({
    open,
    onClose,
    title,
    description,
    footer,
    children,
    className,
}: SheetProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);
    const restoreRef = useRef<HTMLElement | null>(null);
    const pointerInsideRef = useRef(false);
    const titleId = useId();
    const descId = useId();

    // Escape to close, and keep the page behind from scrolling.
    useEffect(() => {
        if (!open) return;

        restoreRef.current = document.activeElement as HTMLElement | null;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                onClose();
            }
        };
        document.addEventListener("keydown", onKey);

        const { overflow } = document.body.style;
        document.body.style.overflow = "hidden";

        // Focus the first control in the BODY, not the panel. Searching the whole
        // panel lands on the header's close button, which is the one control a
        // person opening a form does not want focused.
        const first = bodyRef.current?.querySelector<HTMLElement>(
            'input,select,textarea,button,[href],[tabindex]:not([tabindex="-1"])',
        );
        (first ?? panelRef.current)?.focus();

        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = overflow;
            restoreRef.current?.focus?.();
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            <div
                className="absolute inset-0 bg-foreground/40"
                // A pointer that went DOWN inside the panel and came UP here is a
                // drag, not a dismissal — releasing a text selection outside a
                // half-filled form should not throw the form away.
                onMouseDown={() => {
                    if (!pointerInsideRef.current) onClose();
                }}
                aria-hidden
            />
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descId : undefined}
                tabIndex={-1}
                onMouseDown={() => {
                    pointerInsideRef.current = true;
                    // Reset after the event finishes bubbling to the backdrop.
                    setTimeout(() => {
                        pointerInsideRef.current = false;
                    }, 0);
                }}
                className={cn(
                    "relative z-10 ml-auto flex w-full flex-col bg-card shadow-lg outline-none",
                    // mobile: bottom sheet
                    "mt-auto max-h-[92dvh] rounded-t-2xl",
                    // desktop: full-height right sheet
                    "sm:mt-0 sm:h-dvh sm:max-h-none sm:w-[520px] sm:rounded-none",
                    className,
                )}
            >
                {/* Grab handle — mobile only, matching production's bottom sheet. */}
                <div className="flex justify-center pt-2 sm:hidden" aria-hidden>
                    <span className="h-1 w-10 rounded-full bg-border-strong" />
                </div>

                <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
                    <div className="min-w-0">
                        <h2
                            id={titleId}
                            className="truncate text-base font-semibold text-text-heading"
                        >
                            {title}
                        </h2>
                        {description && (
                            <p id={descId} className="mt-0.5 text-xs text-text-body">
                                {description}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-icon-primary transition-colors hover:bg-ghost-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    {children}
                </div>

                {footer && (
                    <footer className="flex shrink-0 items-center gap-3 border-t border-border-subtle px-5 py-4">
                        {footer}
                    </footer>
                )}
            </div>
        </div>
    );
}
