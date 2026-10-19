"use client";

import { useEffect } from "react";
import { Award, Check, Minus, Shield, Users, Wallet, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    assignAccessThunk,
    fetchAccessThunk,
    removeAccessThunk,
} from "@/features/lx/access/accessThunks";
import type { AccessHead, AccessUser } from "@/features/lx/access/types";
import { useCan } from "@/hooks/useCan";
import { PERMISSIONS, ROLE_LABELS } from "@/lib/permissions";
import { UserPicker } from "./components/UserPicker";

// Compact who-can-do-what reference (mirrors the LXOS permission matrix).
const MATRIX: { action: string; roles: string[] }[] = [
    { action: "Create event", roles: ["ADMIN", "LX_TEAM", "CLUB_HEAD", "CLAN_HEAD"] },
    { action: "Approve event / achievement", roles: ["ADMIN", "LX_TEAM"] },
    { action: "Request room booking", roles: ["ADMIN", "LX_TEAM", "CLUB_HEAD", "CLAN_HEAD"] },
    { action: "Approve room booking", roles: ["ADMIN", "LX_TEAM"] },
    { action: "Allocate clan points", roles: ["ADMIN"] },
    { action: "Submit reimbursement", roles: ["ADMIN", "LX_TEAM", "CLUB_HEAD", "CLAN_HEAD"] },
    { action: "Review reimbursement", roles: ["ADMIN", "LX_TEAM"] },
    { action: "Process reimbursement", roles: ["ADMIN", "FINANCE"] },
    { action: "View all budgets", roles: ["ADMIN", "LX_TEAM", "FINANCE"] },
    { action: "View own budget", roles: ["CLUB_HEAD", "CLAN_HEAD"] },
    { action: "View analytics", roles: ["ADMIN", "LX_TEAM", "FINANCE"] },
    { action: "Book a library cabin", roles: ["Everyone"] },
    { action: "Run the library desk", roles: ["ADMIN", "LIBRARIAN"] },
    { action: "Manage access", roles: ["ADMIN"] },
];
const ALL_ROLES: (keyof typeof ROLE_LABELS)[] = [
    "ADMIN",
    "LX_TEAM",
    "FINANCE",
    "LIBRARIAN",
    "CLUB_HEAD",
    "CLAN_HEAD",
    "GUEST",
];

export default function AccessPage() {
    const dispatch = useAppDispatch();
    const { can } = useCan();
    const overview = useAppSelector((s) => s.lxAccess.overview);
    const loading = useAppSelector((s) => s.lxAccess.loading);
    const error = useAppSelector((s) => s.lxAccess.error);

    const allowed = can(PERMISSIONS.MANAGE_ACCESS);

    useEffect(() => {
        if (allowed) void dispatch(fetchAccessThunk());
    }, [dispatch, allowed]);

    const refresh = () => dispatch(fetchAccessThunk());

    const assign = async (payload: Parameters<typeof assignAccessThunk>[0]) => {
        await dispatch(assignAccessThunk(payload));
        refresh();
    };
    const remove = async (memberId: string, type: "admin" | "lx" | "finance" | "club" | "clan") => {
        await dispatch(removeAccessThunk({ memberId, type }));
        refresh();
    };

    const users = overview?.users ?? [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-primary-text">Access Management</h1>
                <p className="mt-1 text-sm text-text-body">
                    Assign roles and club/clan leadership. Roles decide what each person can see and
                    do.
                </p>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            {/* Permission matrix reference */}
            <section className="rounded-2xl border border-border-subtle bg-card p-5 shadow-xs">
                <h2 className="mb-3 text-sm font-semibold">Who can do what</h2>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead className="bg-subtle">
                            <tr className="border-b border-border text-left text-xs text-text-subheading">
                                <th className="py-2 pr-3 font-medium">Action</th>
                                {ALL_ROLES.map((r) => (
                                    <th key={r} className="px-2 py-2 text-center font-medium">
                                        {ROLE_LABELS[r]}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {MATRIX.map((row) => (
                                <tr key={row.action}>
                                    <td className="py-2 pr-3">{row.action}</td>
                                    {ALL_ROLES.map((r) => (
                                        <td key={r} className="px-2 py-2 text-center">
                                            {row.roles.includes(r) ? (
                                                <Check className="mx-auto h-4 w-4 text-success" />
                                            ) : (
                                                <Minus className="mx-auto h-3.5 w-3.5 text-icon-disabled" />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {loading && !overview ? (
                <p className="text-sm text-text-body">Loading access…</p>
            ) : (
                <>
                    {/* Club heads */}
                    <Section
                        title="Club Heads"
                        icon={Users}
                        desc="A club head can only see their own club's budget and activity."
                    >
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {overview?.clubs.map((club) => (
                                <div key={club.id} className="rounded-lg border border-border p-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">{club.name}</p>
                                        <UserPicker
                                            users={users}
                                            onPick={(u) =>
                                                assign({ ...u, type: "club", clubId: club.id })
                                            }
                                            placeholder="Assign a head…"
                                        />
                                    </div>
                                    <HeadChips
                                        heads={club.heads}
                                        onRemove={(id) => remove(id, "club")}
                                        empty="No head assigned"
                                    />
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* Clan heads */}
                    <Section
                        title="Clan Heads"
                        icon={Shield}
                        desc="A clan head can only see their own clan's budget and initiatives."
                    >
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {overview?.clans.map((clan) => (
                                <div key={clan.id} className="rounded-lg border border-border p-3">
                                    <div className="flex items-center justify-between">
                                        <p className="inline-flex items-center gap-2 text-sm font-medium">
                                            <span
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{ background: clan.color }}
                                            />
                                            {clan.name}
                                        </p>
                                        <UserPicker
                                            users={users}
                                            onPick={(u) =>
                                                assign({ ...u, type: "clan", clanId: clan.id })
                                            }
                                            placeholder="Assign a head…"
                                        />
                                    </div>
                                    <HeadChips
                                        heads={clan.heads}
                                        onRemove={(id) => remove(id, "clan")}
                                        empty="No head assigned"
                                    />
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* Teams */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <TeamCard
                            title="Admins"
                            icon={Shield}
                            members={overview?.admins ?? []}
                            users={users}
                            onAdd={(u) => assign({ ...u, type: "admin" })}
                            onRemove={(id) => remove(id, "admin")}
                        />
                        <TeamCard
                            title="LX Team"
                            icon={Award}
                            members={overview?.lxMembers ?? []}
                            users={users}
                            onAdd={(u) => assign({ ...u, type: "lx" })}
                            onRemove={(id) => remove(id, "lx")}
                        />
                        <TeamCard
                            title="Finance"
                            icon={Wallet}
                            members={overview?.financeMembers ?? []}
                            users={users}
                            onAdd={(u) => assign({ ...u, type: "finance" })}
                            onRemove={(id) => remove(id, "finance")}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

function Section({
    title,
    desc,
    icon: Icon,
    children,
}: {
    title: string;
    desc: string;
    icon: typeof Users;
    children: React.ReactNode;
}) {
    return (
        <section>
            <div className="mb-3 flex items-center gap-2">
                <Icon className="h-4 w-4 text-text-body" />
                <h2 className="text-sm font-semibold">{title}</h2>
                <span className="text-xs text-text-body">— {desc}</span>
            </div>
            {children}
        </section>
    );
}

function HeadChips({
    heads,
    onRemove,
    empty,
}: {
    heads: AccessHead[];
    onRemove: (id: string) => void;
    empty: string;
}) {
    if (heads.length === 0) return <p className="mt-2 text-xs text-text-body">{empty}</p>;
    return (
        <div className="mt-2 flex flex-wrap gap-1.5">
            {heads.map((h) => (
                <span
                    key={h.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-subtle py-1 pl-2.5 pr-1 text-xs"
                >
                    <span title={h.email ?? h.referenceId}>{h.displayName ?? h.referenceId}</span>
                    <button
                        onClick={() => onRemove(h.id)}
                        className="flex h-4 w-4 items-center justify-center rounded-full text-text-body hover:bg-error-subtle hover:text-error"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            ))}
        </div>
    );
}

function TeamCard({
    title,
    icon: Icon,
    members,
    users,
    onAdd,
    onRemove,
}: {
    title: string;
    icon: typeof Shield;
    members: AccessUser[];
    users: AccessUser[];
    onAdd: (u: { memberId?: string; referenceId?: string }) => void;
    onRemove: (id: string) => void;
}) {
    return (
        <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4" /> {title}
                </h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-text-body">
                    {members.length}
                </span>
            </div>
            <div className="space-y-1.5">
                {members.length === 0 ? (
                    <p className="text-xs text-text-body">No members yet.</p>
                ) : (
                    members.map((m) => (
                        <div
                            key={m.id}
                            className="flex items-center justify-between rounded-card border border-border px-2.5 py-1.5"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm">{m.displayName ?? m.referenceId}</p>
                                <p className="truncate text-[11px] text-text-body">
                                    {m.referenceId}
                                </p>
                            </div>
                            <button
                                onClick={() => onRemove(m.id)}
                                className="text-text-body hover:text-error"
                                title="Remove"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
            <div className="mt-3">
                <UserPicker users={users} onPick={onAdd} placeholder={`Add to ${title}…`} />
            </div>
        </div>
    );
}
