"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CheckCircle2, MapPin, Pencil, Users, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    approveEventThunk,
    completeEventThunk,
    fetchEventByIdThunk,
} from "@/features/lx/event/eventThunks";
import { EventStatusBadge } from "../components/EventStatusBadge";
import { EventTypeBadge } from "../components/EventTypeBadge";
import { EditEventForm } from "../components/EditEventForm";
import { formatDateRange } from "../utils/format";
import { useCan } from "@/hooks/useCan";
import { PERMISSIONS } from "@/lib/permissions";
import { HIDDEN, scopedInr } from "@/lib/money";

const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const dispatch = useAppDispatch();
    const event = useAppSelector((s) => s.lxEvent.selected);
    const loading = useAppSelector((s) => s.lxEvent.detailLoading);
    const role = useAppSelector((s) => s.lxActor.current?.role ?? null);
    const { can } = useCan();
    const canApprove = can(PERMISSIONS.APPROVE_EVENT);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        void dispatch(fetchEventByIdThunk(id));
    }, [dispatch, id]);

    const review = (action: "approve" | "reject") => {
        const rejectionReason =
            action === "reject"
                ? (window.prompt("Reason for rejection (optional):") ?? undefined)
                : undefined;
        void dispatch(approveEventThunk({ id, payload: { action, rejectionReason } }));
    };

    const ev = event && event.id === id ? event : null;

    if (loading && !ev) return <p className="text-sm text-text-body">Loading…</p>;
    if (!ev) return <p className="text-sm text-text-body">Event not found.</p>;

    const venue = ev.roomNames?.length ? ev.roomNames.join(", ") : ev.location || "—";
    const requirements = Array.isArray(ev.requirements) ? ev.requirements : [];

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <Link
                href="/lx/events"
                className="inline-flex items-center gap-1.5 text-sm text-text-body hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" /> Back to events
            </Link>

            <div className="rounded-2xl border border-border-subtle bg-card p-6 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <EventTypeBadge type={ev.type} />
                            <EventStatusBadge status={ev.status} />
                        </div>
                        <h1 className="text-2xl font-bold text-primary-text">{ev.title}</h1>
                        <p className="mt-1 text-sm text-text-body">
                            {ev.clubName || ev.clanName || "LX"} · by {ev.createdByName}
                        </p>
                    </div>
                    {can(PERMISSIONS.EDIT_EVENT) && (
                        <Button
                            variant="outline"
                            className="shrink-0 gap-1.5"
                            onClick={() => setEditing(true)}
                        >
                            <Pencil className="h-4 w-4" /> Edit
                        </Button>
                    )}
                </div>

                {editing && <EditEventForm event={ev} onClose={() => setEditing(false)} />}

                <p className="mt-4 text-sm">{ev.description}</p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Info icon={MapPin} label="Venue" value={venue} />
                    <Info icon={Users} label="Attendees" value={String(ev.attendees || 0)} />
                    {/* Scoped: only the owning club/clan head and finance roles see this. */}
                    <Info
                        icon={Wallet}
                        label="Budget"
                        value={
                            ev.budgetVisible
                                ? `${scopedInr(ev.budgetSpent)} / ${scopedInr(ev.budgetAllocated)}`
                                : HIDDEN
                        }
                    />
                </div>

                <div className="mt-4 rounded-lg bg-subtle p-3 text-sm">
                    <span className="text-text-body">When: </span>
                    {formatDateRange(ev.startDate, ev.endDate)}
                </div>

                {requirements.length > 0 && (
                    <div className="mt-5">
                        <h2 className="text-sm font-semibold">Requirements</h2>
                        <div className="mt-2 overflow-x-auto rounded-lg border border-border">
                            <table className="w-full min-w-[380px] text-sm">
                                <thead className="bg-subtle text-left text-xs text-text-body">
                                    <tr>
                                        <th className="px-3 py-2 font-medium">Item</th>
                                        <th className="px-3 py-2 font-medium">Qty</th>
                                        <th className="px-3 py-2 font-medium">Est. cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {requirements.map(
                                        (
                                            r: {
                                                item: string;
                                                quantity?: number;
                                                estimatedCost?: number;
                                            },
                                            i: number,
                                        ) => (
                                            <tr key={i}>
                                                <td className="px-3 py-2">{r.item}</td>
                                                <td className="px-3 py-2">{r.quantity ?? 1}</td>
                                                <td className="px-3 py-2">
                                                    {inr.format(r.estimatedCost ?? 0)}
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {ev.status === "REJECTED" && ev.rejectionReason && (
                    <p className="mt-4 rounded-lg bg-error-subtle p-3 text-sm text-error">
                        Rejected: {ev.rejectionReason}
                    </p>
                )}
                {ev.status === "APPROVED" && ev.approvedByName && (
                    <p className="mt-4 text-xs text-text-body">Approved by {ev.approvedByName}</p>
                )}

                {canApprove && (ev.status === "PENDING" || ev.status === "APPROVED") && (
                    <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
                        {ev.status === "PENDING" && (
                            <>
                                <Button
                                    variant="softSuccess"
                                    className="gap-1.5"
                                    onClick={() => review("approve")}
                                >
                                    <Check className="h-4 w-4" /> Approve
                                </Button>
                                <Button
                                    variant="softDanger"
                                    className="gap-1.5"
                                    onClick={() => review("reject")}
                                >
                                    <X className="h-4 w-4" /> Reject
                                </Button>
                            </>
                        )}
                        {ev.status === "APPROVED" && (
                            <Button
                                variant="outline"
                                className="gap-1.5"
                                onClick={() => dispatch(completeEventThunk(id))}
                            >
                                <CheckCircle2 className="h-4 w-4" /> Mark completed
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function Info({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
    return (
        <div className="rounded-lg border border-border p-3">
            <div className="flex items-center gap-1.5 text-xs text-text-body">
                <Icon className="h-3.5 w-3.5" /> {label}
            </div>
            <p className="mt-1 text-sm font-medium">{value}</p>
        </div>
    );
}
