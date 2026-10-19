"use client";

import type { PointerEvent as ReactPointerEvent, ReactNode, Ref } from "react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Lock, Menu, X } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { fetchMeThunk, fetchUsersThunk } from "@/features/lx/actor/actorThunks";
import { useCan } from "@/hooks/useCan";
import { LX_ROUTES } from "@/lib/routes";
import { RoleGuard } from "@/components/lx/RoleGuard";
import { RoleSwitcher } from "@/components/lx/RoleSwitcher";
import { cn } from "@/lib/utils";

type NavItem = (typeof LX_ROUTES)[0];

/* ---------------------------------------------------------------------------
 * Rail behaviour, matched to production.
 *
 * Read out of RishiVerse's shipped bundle rather than inferred from the
 * outside: its handlers are React-delegated, so synthetic pointer events never
 * reach them and the rail looks inert to any probing from the console.
 *
 * The real component is driven by a THREE-state lock, not a boolean:
 *
 *     lockState: "auto" | "locked-open" | "locked-closed"
 *     expanded  = lockState === "locked-open" || (lockState === "auto" && hovered)
 *
 * In "auto" the rail follows the cursor: it opens 60ms after the pointer
 * enters and closes IMMEDIATELY when it leaves — there is no close delay. The
 * toggle only exists once the rail is already open, and clicking it locks
 * whichever state you are looking at, so it reads as "keep it like this".
 * Clicking again hands control back to the cursor; the icon becomes a padlock
 * while locked.
 *
 * The rail sits in normal flow, so expanding PUSHES the page. An earlier pass
 * here made hover overlay the page instead, which is not what the product does.
 * ------------------------------------------------------------------------ */
type LockState = "auto" | "locked-open" | "locked-closed";

const LOCK_KEY = "lx-rail-lock";
const LOCK_EVENT = "lx-rail-change";

function subscribeLock(onChange: () => void) {
    window.addEventListener("storage", onChange);
    window.addEventListener(LOCK_EVENT, onChange);
    return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener(LOCK_EVENT, onChange);
    };
}
const getLock = (): LockState => {
    try {
        const v = localStorage.getItem(LOCK_KEY);
        return v === "locked-open" || v === "locked-closed" ? v : "auto";
    } catch {
        return "auto";
    }
};
const getLockServer = (): LockState => "auto";

function setLock(next: LockState) {
    try {
        localStorage.setItem(LOCK_KEY, next);
    } catch {
        /* blocked storage still applies for this page view */
    }
    window.dispatchEvent(new Event(LOCK_EVENT));
}

/**
 * Production animates the width with a framer-motion spring
 * (stiffness 200, damping 30, mass 0.9). That is a damping ratio of about 1.12
 * — overdamped, so it settles without overshoot and is indistinguishable from
 * a strong ease-out. framer-motion is not a dependency here and the
 * integration plan forbids adding one, so this curve approximates that spring.
 */
const SPRING = "cubic-bezier(0.25, 1, 0.5, 1)";

function NavRow({
    item,
    active,
    expanded,
    onNavigate,
    activeRef,
}: {
    item: NavItem;
    active: boolean;
    expanded: boolean;
    onNavigate?: () => void;
    activeRef?: Ref<HTMLAnchorElement>;
}) {
    const { icon: Icon, label, href } = item;
    return (
        <Link
            ref={activeRef}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className="group relative flex h-10 items-center rounded-2xl"
        >
            {active && (
                <span className="absolute inset-0 z-0 rounded-2xl bg-sidebar-accent" aria-hidden />
            )}
            <span className="z-10 flex w-11 shrink-0 justify-center">
                <Icon
                    className={cn(
                        "h-5 w-5 transition-colors duration-200",
                        active
                            ? "text-sidebar-accent-foreground"
                            : "text-sidebar-icon group-hover:text-sidebar-icon-hover",
                    )}
                />
            </span>
            <span
                className="flex items-center overflow-hidden transition-[width,opacity] motion-reduce:transition-none"
                style={{
                    width: expanded ? 160 : 0,
                    opacity: expanded ? 1 : 0,
                    transitionDuration: "200ms, 150ms",
                    transitionTimingFunction: SPRING,
                }}
            >
                <span
                    className={cn(
                        "z-10 ml-1 truncate pr-3 text-sm font-medium whitespace-nowrap transition-colors duration-200",
                        active
                            ? "text-sidebar-accent-foreground"
                            : "text-sidebar-label group-hover:text-sidebar-label-hover",
                    )}
                >
                    {label}
                </span>
            </span>

            {/* Collapsed only, exactly as production does it. */}
            {!expanded && (
                <span
                    role="tooltip"
                    className="pointer-events-none absolute left-full z-20 ml-2 hidden rounded bg-foreground px-2 py-1 text-xs whitespace-nowrap text-background opacity-0 transition-opacity group-hover:opacity-100 md:block"
                >
                    {label}
                </span>
            )}
        </Link>
    );
}

function NavRows({
    pathname,
    expanded,
    onNavigate,
    activeRef,
}: {
    pathname: string;
    expanded: boolean;
    onNavigate?: () => void;
    activeRef?: Ref<HTMLAnchorElement>;
}) {
    const { can, role } = useCan();
    const visible = LX_ROUTES.filter((n) => !n.rule || n.rule({ can, role }));
    return (
        <nav className="flex flex-col gap-2">
            {visible.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                    <NavRow
                        key={item.href}
                        item={item}
                        active={active}
                        expanded={expanded}
                        onNavigate={onNavigate}
                        activeRef={active ? activeRef : undefined}
                    />
                );
            })}
        </nav>
    );
}

export default function LxLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const [mobileOpen, setMobileOpen] = useState(false);

    const lockState = useSyncExternalStore(subscribeLock, getLock, getLockServer);
    const [hovered, setHovered] = useState(false);
    const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const activeRef = useRef<HTMLAnchorElement>(null);

    const expanded = lockState === "locked-open" || (lockState === "auto" && hovered);

    // Longest prefix match: /lx/expenses/new matches /lx/expenses
    const currentRoute = LX_ROUTES.filter((r) => pathname.startsWith(r.href)).sort(
        (a, b) => b.href.length - a.href.length,
    )[0];

    useEffect(() => {
        void dispatch(fetchUsersThunk());
        void dispatch(fetchMeThunk());
    }, [dispatch]);

    // Production keeps the current item in view when it changes.
    useEffect(() => {
        activeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, [pathname]);

    useEffect(
        () => () => {
            if (openTimer.current) clearTimeout(openTimer.current);
        },
        [],
    );

    // 60ms to open, nothing to close — production's exact timings.
    const onEnter = (e: ReactPointerEvent) => {
        if (e.pointerType !== "mouse" || lockState !== "auto") return;
        openTimer.current = setTimeout(() => setHovered(true), 60);
    };
    const onLeave = (e: ReactPointerEvent) => {
        if (e.pointerType !== "mouse" || lockState !== "auto") return;
        if (openTimer.current) clearTimeout(openTimer.current);
        setHovered(false);
    };

    /*
     * From "auto" the toggle locks whichever state you are looking at — open if
     * the rail is currently open, closed if it is not. From either locked state
     * it hands control back to the cursor.
     */
    const onToggle = useCallback(() => {
        if (lockState === "auto") setLock(hovered ? "locked-open" : "locked-closed");
        else setLock("auto");
    }, [lockState, hovered]);

    const lockLabel =
        lockState === "auto"
            ? expanded
                ? "Keep sidebar expanded"
                : "Keep sidebar collapsed"
            : "Let the sidebar follow the cursor again";

    return (
        <div>
            <div className="mb-4 flex items-center gap-3 md:hidden">
                <button
                    type="button"
                    aria-label="Open menu"
                    onClick={() => setMobileOpen(true)}
                    className="rounded-full border border-border bg-card p-2 text-icon-primary hover:bg-subtle"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            <div className="flex items-start gap-2">
                {/* In flow, so expanding pushes the page — as production does. */}
                <aside
                    onPointerEnter={onEnter}
                    onPointerLeave={onLeave}
                    className="sticky top-4 hidden shrink-0 flex-col overflow-hidden transition-[width] motion-reduce:transition-none md:flex"
                    style={{
                        width: expanded ? 220 : 60,
                        transitionDuration: "380ms",
                        transitionTimingFunction: SPRING,
                    }}
                >
                    {/* The toggle only exists once the rail is open. */}
                    <div className="flex h-10 shrink-0 items-center justify-end px-3">
                        <button
                            type="button"
                            onClick={onToggle}
                            aria-label={lockLabel}
                            title={lockLabel}
                            className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-full transition-opacity duration-200",
                                expanded ? "opacity-100" : "pointer-events-none opacity-0",
                            )}
                        >
                            {lockState === "auto" ? (
                                <ChevronLeft className="h-4 w-4 text-icon-secondary" />
                            ) : (
                                <Lock className="h-4 w-4 text-icon-disabled" />
                            )}
                        </button>
                    </div>

                    <div className="max-h-[58dvh] flex-1 overflow-x-hidden overflow-y-auto px-2 pb-4">
                        <NavRows pathname={pathname} expanded={expanded} activeRef={activeRef} />
                    </div>

                    <div className="h-4 shrink-0" />

                    {/* Dev-only actor switcher; it has no place in the collapsed rail. */}
                    {expanded && (
                        <div className="shrink-0 px-2 pb-2">
                            <RoleSwitcher />
                        </div>
                    )}
                </aside>

                <div className="min-w-0 flex-1">
                    <RoleGuard rule={currentRoute?.rule}>{children}</RoleGuard>
                </div>
            </div>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="absolute inset-0 bg-foreground/40"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="absolute top-0 left-0 flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar p-4 shadow-lg">
                        <div className="mb-3 flex items-center justify-end">
                            <button
                                type="button"
                                aria-label="Close menu"
                                onClick={() => setMobileOpen(false)}
                                className="rounded-full p-1 text-icon-primary hover:bg-ghost-hover"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <NavRows
                            pathname={pathname}
                            expanded
                            onNavigate={() => setMobileOpen(false)}
                        />
                        <div className="mt-6">
                            <RoleSwitcher />
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}
