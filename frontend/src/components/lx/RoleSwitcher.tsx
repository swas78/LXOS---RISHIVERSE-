"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMeThunk, fetchUsersThunk } from "@/features/lx/actor/actorThunks";
import type { LxMemberRole, LxMember } from "@/features/lx/actor/types";
import { ROLE_BADGE, ROLE_LABELS } from "@/lib/permissions";
import { LX_ACTOR_STORAGE_KEY } from "@/lib/axios";

const GROUP_ORDER: LxMemberRole[] = [
    "ADMIN",
    "LX_TEAM",
    "FINANCE",
    "LIBRARIAN",
    "CLUB_HEAD",
    "CLAN_HEAD",
    "GUEST",
];

function initials(name: string) {
    return name
        .split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

/**
 * DEV-ONLY "view as" control. In RishiVerse the acting user comes from real
 * auth; this switcher lets us exercise the RBAC locally. Switching reloads so
 * every module refetches as the chosen user.
 */
export function RoleSwitcher() {
    const dispatch = useAppDispatch();
    const users = useAppSelector((s) => s.lxActor.users);
    const current = useAppSelector((s) => s.lxActor.current);
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        void dispatch(fetchUsersThunk());
        void dispatch(fetchMeThunk());
    }, [dispatch]);

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    const groups = useMemo(() => {
        const term = q.trim().toLowerCase();
        const filtered = term
            ? users.filter(
                  (u) =>
                      (u.displayName ?? u.referenceId).toLowerCase().includes(term) ||
                      u.referenceId.toLowerCase().includes(term) ||
                      (u.email ?? "").toLowerCase().includes(term),
              )
            : users;
        const by: Record<string, LxMember[]> = {};
        for (const u of filtered) (by[u.role] ||= []).push(u);
        return GROUP_ORDER.filter((r) => by[r]?.length).map((r) => ({ role: r, list: by[r] }));
    }, [users, q]);

    // Store the core referenceId, not the LxMember row id — that is what the
    // x-lx-actor-ref header carries and what the backend resolves against.
    const switchTo = (referenceId: string) => {
        try {
            window.localStorage.setItem(LX_ACTOR_STORAGE_KEY, referenceId);
        } catch {
            /* ignore */
        }
        window.location.reload();
    };

    const role = (current?.role ?? "GUEST") as LxMemberRole;
    const badge = ROLE_BADGE[role];

    return (
        <div ref={ref} className="relative">
            <p className="mb-1 px-1 text-[10px] font-medium uppercase tracking-wide text-text-body">
                Viewing as (dev)
            </p>
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 text-left hover:bg-subtle"
            >
                <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                    style={{ background: badge.bg, color: badge.fg }}
                >
                    {current ? initials(current.displayName ?? current.referenceId) : "…"}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium">
                        {current?.displayName ?? current?.referenceId ?? "Loading…"}
                    </span>
                    <span className="block truncate text-[10px] text-text-body">
                        {ROLE_LABELS[role]}
                    </span>
                </span>
                <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-text-body" />
            </button>

            {open && (
                <div className="absolute bottom-full left-0 z-30 mb-1 max-h-[26rem] w-72 overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-xl">
                    <div className="border-b border-border p-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-body" />
                            <input
                                autoFocus
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search people…"
                                className="h-8 w-full rounded-card border border-border bg-card pl-8 pr-2 text-xs outline-none focus:border-border-focus"
                            />
                        </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto py-1">
                        {groups.map((g) => (
                            <div key={g.role}>
                                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-body">
                                    {ROLE_LABELS[g.role]}
                                </p>
                                {g.list.map((u) => (
                                    <button
                                        key={u.id}
                                        onClick={() => switchTo(u.referenceId)}
                                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-subtle"
                                    >
                                        <span
                                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                                            style={{
                                                background: ROLE_BADGE[u.role].bg,
                                                color: ROLE_BADGE[u.role].fg,
                                            }}
                                        >
                                            {initials(u.displayName ?? u.referenceId)}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-xs">
                                                {u.displayName ?? u.referenceId}
                                            </span>
                                            <span className="block truncate text-[10px] text-text-body">
                                                {u.referenceId}
                                            </span>
                                        </span>
                                        {current?.referenceId === u.referenceId && (
                                            <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        ))}
                        {groups.length === 0 && (
                            <p className="p-3 text-xs text-text-body">No people match.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
