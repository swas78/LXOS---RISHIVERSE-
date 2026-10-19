"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Light / system / dark switch.
 *
 * This lives in the kit shell on purpose. The brand ships a full dark theme,
 * and without a way to turn it on nobody can review it — but production
 * RishiVerse owns its own shell, and `app/(erp)/layout.tsx` is on the
 * "never copy" list in the integration plan. So the control stays here, where
 * it demonstrates the tokens and then does not follow the module into v2.
 *
 * The tokens respond to BOTH `prefers-color-scheme` and an explicit
 * `.dark` / `.light` class, so "system" is a real third state rather than a
 * relabelled light.
 *
 * localStorage is an external store, so it is read through
 * `useSyncExternalStore` rather than an effect. That keeps the server snapshot
 * ("system") separate from the client one, so hydration cannot mismatch, and
 * it picks up the `storage` event, so changing the theme in one tab moves the
 * other tabs too.
 */
type Mode = "light" | "system" | "dark";

const KEY = "lx-theme";
const EVENT = "lx-theme-change";

function subscribe(onChange: () => void) {
    window.addEventListener("storage", onChange);
    window.addEventListener(EVENT, onChange);
    return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener(EVENT, onChange);
    };
}

function getSnapshot(): Mode {
    try {
        const stored = localStorage.getItem(KEY);
        return stored === "light" || stored === "dark" ? stored : "system";
    } catch {
        // Private mode and blocked site data both throw on access.
        return "system";
    }
}

/** The server cannot know the stored choice, so it always renders "system". */
const getServerSnapshot = (): Mode => "system";

export function applyTheme(mode: Mode) {
    const el = document.documentElement;
    el.classList.remove("light", "dark");
    if (mode !== "system") el.classList.add(mode);
    try {
        if (mode === "system") localStorage.removeItem(KEY);
        else localStorage.setItem(KEY, mode);
    } catch {
        /* The class is already applied, so the choice still works for this
           page view even when it cannot be persisted. */
    }
    window.dispatchEvent(new Event(EVENT));
}

const OPTIONS: { value: Mode; label: string; Icon: typeof Sun }[] = [
    { value: "light", label: "Light", Icon: Sun },
    { value: "system", label: "System", Icon: Monitor },
    { value: "dark", label: "Dark", Icon: Moon },
];

export function ThemeToggle() {
    const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    return (
        <div
            role="radiogroup"
            aria-label="Colour theme"
            className="inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5"
        >
            {OPTIONS.map(({ value, label, Icon }) => (
                <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={mode === value}
                    title={label}
                    onClick={() => applyTheme(value)}
                    className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                        mode === value
                            ? "bg-primary-subtle text-primary-subtle-foreground"
                            : "text-icon-secondary hover:bg-ghost-hover",
                    )}
                >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="sr-only">{label}</span>
                </button>
            ))}
        </div>
    );
}
