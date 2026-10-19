import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Measured off the signed-in production app, not guessed.
 *
 * RishiVerse runs two different primary treatments and they are not
 * interchangeable:
 *
 *   - `primary` — a page-level call to action ("Join a club"). Solid crimson,
 *     white label, `--radius` (10px), 36px tall. Sits next to the page title.
 *   - `cta` — the submit inside a sheet or an auth form ("Generate pass",
 *     "Sign in"). A peach PILL with dark text, 40px tall, and it fills the
 *     footer next to Cancel. Production's own class is
 *     `bg-[#F8DDCA] text-[#32302F] disabled:opacity-60`, so the peach is the
 *     enabled colour rather than a disabled state.
 *
 * Buttons are NOT pills by default — only the sheet footer pair is. The page
 * buttons use the 10px `--radius`. (The sign-in screen is pill-only because it
 * is an auth form, which is the `cta` case.)
 */
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?:
        | "primary"
        | "primarySolid"
        | "cta"
        | "soft"
        | "softSuccess"
        | "softDanger"
        | "outline"
        | "ghost"
        | "subtle"
        | "danger";
    size?: "sm" | "md" | "lg" | "icon";
};

const VARIANT: Record<NonNullable<ButtonProps["variant"]>, string> = {
    /*
     * The page action, as Gate Pass renders it: an OUTLINE pill with the brand
     * orange as its ink, not a solid fill. "+ Generate Exit Pass" sits beside
     * the round tool buttons and reads as one of them, just wider — a solid
     * crimson block next to those hairline circles looks like a different app.
     */
    primary:
        "rounded-full border border-border bg-card text-brand-subtle-foreground hover:bg-brand-subtle [&_svg]:text-brand-subtle-foreground",
    /** Kept for the rare case a page action must dominate. */
    primarySolid: "rounded-card bg-primary text-primary-foreground hover:bg-primary-hover",
    cta: "rounded-full bg-cta text-cta-foreground hover:brightness-95",
    outline: "rounded-card border border-input bg-card text-text-subheading hover:bg-subtle",
    ghost: "rounded-card text-text-subheading hover:bg-ghost-hover",
    subtle: "rounded-card bg-primary-subtle text-primary-subtle-foreground hover:bg-primary-subtle/70",
    danger: "rounded-full bg-error-subtle text-error-subtle-foreground hover:bg-error-subtle/70",

    /*
     * Soft pills — the product's actual button language.
     *
     * Nothing in RishiVerse uses a saturated fill for an action. Even "Delete"
     * in the confirm dialog is a pale pink pill with dark text, and Cancel
     * beside it is a pale grey one. A solid green Approve next to a solid red
     * Reject shouts at a person who is only triaging a queue, and it stops
     * reading as the same product.
     *
     * `danger` above is kept for the rare case something genuinely must not be
     * missed, but these are the defaults.
     */
    soft: "rounded-full bg-muted text-text-heading hover:bg-muted/70",
    softSuccess:
        "rounded-full bg-success-subtle text-success-subtle-foreground hover:bg-success-subtle/70",
    softDanger:
        "rounded-full bg-error-subtle text-error-subtle-foreground hover:bg-error-subtle/70",
};

const SIZE: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "h-8 gap-1.5 px-3 text-xs",
    md: "h-9 gap-2 px-3 text-sm",
    lg: "h-10 gap-2 px-4 text-sm",
    icon: "h-9 w-9",
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
    return (
        <button
            className={cn(
                "inline-flex shrink-0 items-center justify-center font-medium transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                "disabled:pointer-events-none disabled:opacity-60",
                "[&_svg]:pointer-events-none [&_svg]:shrink-0",
                VARIANT[variant],
                SIZE[size],
                className,
            )}
            {...props}
        />
    );
}

/**
 * The Cancel half of a sheet footer: a pill outline, 40px, sharing the width
 * with the `cta` submit beside it.
 */
export function SheetCancelButton({
    className,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            className={cn(
                "inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-full",
                "border border-input-strong px-4 text-sm",
                "font-medium whitespace-nowrap text-text-subheading transition-colors",
                "hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2",
                "focus-visible:outline-ring [&_svg]:pointer-events-none [&_svg]:shrink-0 sm:px-10",
                className,
            )}
            {...props}
        />
    );
}

/** The submit half of a sheet footer. Pairs with `SheetCancelButton`. */
export function SheetSubmitButton({
    className,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={cn(
                "inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-full",
                "bg-cta px-4 text-sm font-medium",
                "whitespace-nowrap text-cta-foreground transition-[filter,opacity]",
                "hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                "[&_svg]:pointer-events-none [&_svg]:shrink-0 sm:px-10",
                className,
            )}
            {...props}
        />
    );
}
