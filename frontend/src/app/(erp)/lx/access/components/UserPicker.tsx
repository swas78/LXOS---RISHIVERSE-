"use client";

import { useMemo, useState } from "react";
import { Search, UserPlus, X } from "lucide-react";
import type { AccessUser } from "@/features/lx/access/types";

// Searchable picker over known LX members; also accepts a raw enrollment or
// employee id (core `User.referenceId`) to grant access to someone who has no
// LX overlay yet. Mirrors the real LXOS RU-directory picker — in production
// this searches the core directory rather than the LX table.
export function UserPicker({
    users,
    onPick,
    placeholder,
}: {
    users: AccessUser[];
    onPick: (u: { memberId?: string; referenceId?: string }) => void;
    placeholder?: string;
}) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");

    const results = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return users.slice(0, 8);
        return users
            .filter(
                (u) =>
                    (u.displayName ?? "").toLowerCase().includes(term) ||
                    u.referenceId.toLowerCase().includes(term) ||
                    (u.email ?? "").toLowerCase().includes(term),
            )
            .slice(0, 8);
    }, [q, users]);

    // An enrollment number (RU2024BTC042) or employee id (EMP0417) identifies
    // someone who may not have an LxMember row yet.
    const isReferenceId = /^(RU|EMP)[A-Z0-9]{3,}$/i.test(q.trim());

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
                <UserPlus className="h-3.5 w-3.5" /> Add person
            </button>
        );
    }

    return (
        <div className="relative w-full max-w-sm">
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-body" />
                <input
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={placeholder || "Search name, or type an enrollment/employee id…"}
                    className="h-9 w-full rounded-lg border border-border bg-card pl-8 pr-8 text-sm outline-none focus:border-border-focus"
                />
                <button
                    onClick={() => {
                        setOpen(false);
                        setQ("");
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-body hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
            <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
                {results.map((u) => (
                    <button
                        key={u.id}
                        onClick={() => {
                            onPick({ memberId: u.id });
                            setOpen(false);
                            setQ("");
                        }}
                        className="w-full border-b border-border/50 px-3 py-2 text-left last:border-0 hover:bg-subtle"
                    >
                        <p className="text-sm">{u.displayName ?? u.referenceId}</p>
                        <p className="text-[11px] text-text-body">
                            {u.referenceId} · {u.role}
                        </p>
                    </button>
                ))}
                {isReferenceId && (
                    <button
                        onClick={() => {
                            onPick({ referenceId: q.trim().toUpperCase() });
                            setOpen(false);
                            setQ("");
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-subtle"
                    >
                        <p className="text-sm text-primary">
                            Grant access to “{q.trim().toUpperCase()}”
                        </p>
                        <p className="text-[11px] text-text-body">
                            Creates the LX record for this enrollment / employee id
                        </p>
                    </button>
                )}
                {results.length === 0 && !isReferenceId && (
                    <p className="p-3 text-xs text-text-body">
                        No matches. Type a full enrollment number (RU2024BTC042) or employee id
                        (EMP0417) to add someone new.
                    </p>
                )}
            </div>
        </div>
    );
}
