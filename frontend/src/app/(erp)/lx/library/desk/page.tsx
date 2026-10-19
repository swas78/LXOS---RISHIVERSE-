"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Ban, CheckCircle2, Loader2, Power, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    actOnCabinBookingThunk,
    fetchCabinBlocksThunk,
    fetchDeskBoardThunk,
    liftCabinBlockThunk,
    updateCabinThunk,
} from "@/features/lx/cabin/cabinThunks";
import {
    selectCabinActing,
    selectCabinBlocks,
    selectDeskBoard,
    selectDeskLoading,
} from "@/features/lx/cabin/cabinSelectors";
import type { LxCabinBooking, LxCabinBookingAction } from "@/features/lx/cabin/types";
import { useCan } from "@/hooks/useCan";
import { PERMISSIONS } from "@/lib/permissions";

const timeLeft = (target: string | null) => {
    if (!target) return null;
    const ms = new Date(target).getTime() - Date.now();
    if (ms <= 0) return "now";
    const total = Math.floor(ms / 1000);
    return `${Math.floor(total / 60)}m ${String(total % 60).padStart(2, "0")}s`;
};

export default function LibraryDeskPage() {
    const dispatch = useAppDispatch();
    const board = useAppSelector(selectDeskBoard);
    const loading = useAppSelector(selectDeskLoading);
    const acting = useAppSelector(selectCabinActing);
    const blocks = useAppSelector(selectCabinBlocks);
    const { can } = useCan();

    const [, tick] = useState(0);

    const load = useCallback(() => {
        void dispatch(fetchDeskBoardThunk());
        void dispatch(fetchCabinBlocksThunk());
    }, [dispatch]);

    useEffect(() => {
        load();
    }, [load]);

    // The desk board is a live queue: deadlines run out while the librarian is
    // looking at it, so it both re-renders every second and refetches every 15.
    useEffect(() => {
        const render = setInterval(() => tick((n) => n + 1), 1000);
        const refetch = setInterval(load, 15000);
        return () => {
            clearInterval(render);
            clearInterval(refetch);
        };
    }, [load]);

    const act = async (booking: LxCabinBooking, action: LxCabinBookingAction) => {
        await dispatch(actOnCabinBookingThunk({ id: booking.id, action }));
        load();
    };

    if (!can(PERMISSIONS.MANAGE_LIBRARY_CABINS)) {
        return (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
                <p className="text-sm text-text-body">The library desk is for library staff.</p>
            </div>
        );
    }

    if (loading && !board) {
        return (
            <div className="flex items-center gap-2 py-16 text-sm text-text-body">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading the desk board…
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <Link
                    href="/lx/library"
                    className="inline-flex items-center gap-1.5 text-sm text-text-body transition hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to cabins
                </Link>
                <h1 className="mt-2 text-2xl font-bold text-primary-text">Library Desk</h1>
                <p className="mt-1 text-sm text-text-body">
                    Cabin bookings for {board?.date}. Check people in, close sessions, and manage
                    blocks.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <Stat label="Booked" value={board?.stats.booked ?? 0} />
                <Stat label="Checked in" value={board?.stats.checkedIn ?? 0} tone="emerald" />
                <Stat label="Seats in use" value={board?.stats.seatsInUse ?? 0} />
                <Stat label="No-shows" value={board?.stats.noShows ?? 0} tone="red" />
                <Stat label="Cancelled" value={board?.stats.cancelled ?? 0} />
            </div>

            {/* Ordered the way the desk actually works: whoever is standing there
          now comes first, then who is inside, then who is coming. */}
            <Section
                title="Awaiting check-in"
                hint="10 minutes from the start of the slot, then it is forfeited"
                tone="amber"
                empty="Nobody is waiting to check in."
                bookings={board?.awaitingCheckIn ?? []}
                render={(b) => (
                    <>
                        <Row label="Deadline" value={timeLeft(b.checkInDeadline) ?? "—"} strong />
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                                variant="softSuccess"
                                className="h-8 gap-1.5 text-xs"
                                disabled={acting}
                                onClick={() => act(b, "check-in")}
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Check in
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 gap-1.5 text-xs"
                                disabled={acting}
                                onClick={() => act(b, "no-show")}
                            >
                                <AlertTriangle className="h-3.5 w-3.5" /> No-show
                            </Button>
                        </div>
                    </>
                )}
            />

            <Section
                title="Ongoing sessions"
                tone="emerald"
                empty="No cabins are in use right now."
                bookings={board?.ongoing ?? []}
                render={(b) => (
                    <>
                        <Row label="Ends in" value={timeLeft(b.endAt) ?? "—"} strong />
                        <div className="mt-3">
                            <Button
                                variant="outline"
                                className="h-8 text-xs"
                                disabled={acting}
                                onClick={() => act(b, "check-out")}
                            >
                                Check out
                            </Button>
                        </div>
                    </>
                )}
            />

            <Section
                title="Upcoming"
                tone="stone"
                empty="Nothing else booked today."
                bookings={board?.upcoming ?? []}
                render={(b) => <Row label="Starts in" value={timeLeft(b.startAt) ?? "—"} />}
            />

            {/* Frequent cancellers are SURFACED, not auto-punished. The printed rule
          says three cancellations in a week is a permanent block; applying that
          automatically would bar a student with no conversation and no appeal. */}
            {(board?.watchlist.length ?? 0) > 0 && (
                <div className="rounded-xl border border-warning-subtle bg-warning-subtle/60 p-4">
                    <h2 className="text-sm font-semibold">Frequent cancellations this week</h2>
                    <p className="mt-0.5 text-xs text-text-body">
                        Not blocked automatically — have a word first, then apply a block if it is
                        warranted.
                    </p>
                    <div className="mt-3 space-y-1.5">
                        {board?.watchlist.map((w) => (
                            <div
                                key={w.memberRef}
                                className="flex items-center justify-between gap-3 text-sm"
                            >
                                <span>
                                    {w.name}{" "}
                                    <span className="text-xs text-text-body">· {w.memberRef}</span>
                                </span>
                                <span className="text-xs font-medium text-warning">
                                    {w.cancellations} cancellations
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-xs">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                    <Ban className="h-4 w-4 text-error" /> Active blocks
                </h2>
                {blocks.length === 0 ? (
                    <p className="mt-2 text-sm text-text-body">Nobody is blocked right now.</p>
                ) : (
                    <div className="mt-3 space-y-2">
                        {blocks.map((b) => (
                            <div
                                key={b.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-medium">
                                        {b.memberName ?? b.memberRef}
                                        <span className="ml-2 text-xs font-normal text-text-body">
                                            {b.memberRef}
                                        </span>
                                    </p>
                                    <p className="text-xs text-text-body">
                                        {b.reason === "NO_SHOW"
                                            ? "Missed check-in"
                                            : b.reason.toLowerCase()}{" "}
                                        ·{" "}
                                        {b.isPermanent
                                            ? "permanent"
                                            : `until ${new Date(b.expiresAt!).toLocaleDateString(
                                                  "en-IN",
                                                  {
                                                      day: "numeric",
                                                      month: "short",
                                                      timeZone: "Asia/Kolkata",
                                                  },
                                              )}`}
                                    </p>
                                    {b.note && (
                                        <p className="mt-0.5 text-[11px] text-text-body">
                                            {b.note}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    className="h-8 shrink-0 text-xs"
                                    onClick={() => {
                                        const reason =
                                            window.prompt("Why is this block being lifted?") ??
                                            undefined;
                                        void dispatch(
                                            liftCabinBlockThunk({ id: b.id, reason }),
                                        ).then(load);
                                    }}
                                >
                                    Lift block
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-xs">
                <h2 className="text-sm font-semibold">Cabins</h2>
                <p className="mt-0.5 text-xs text-text-body">
                    Taking a cabin out of service hides its slots from students and shows them the
                    reason.
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {board?.cabins.map((c) => (
                        <div
                            key={c.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-medium">{c.name}</p>
                                <p className="text-xs text-text-body">
                                    {c.minCapacity}-{c.maxCapacity} people
                                    {c.floor ? ` · ${c.floor}` : ""}
                                    {!c.isActive && c.unavailableReason
                                        ? ` · ${c.unavailableReason}`
                                        : ""}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="h-8 shrink-0 gap-1.5 text-xs"
                                onClick={() => {
                                    const payload = c.isActive
                                        ? {
                                              isActive: false,
                                              unavailableReason:
                                                  window.prompt(
                                                      "Why is this cabin out of service?",
                                                  ) || "Temporarily out of service",
                                          }
                                        : { isActive: true };
                                    void dispatch(updateCabinThunk({ id: c.id, payload })).then(
                                        load,
                                    );
                                }}
                            >
                                <Power className="h-3.5 w-3.5" />
                                {c.isActive ? "Take out of service" : "Put back"}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "emerald" | "red" }) {
    const color =
        tone === "emerald" ? "text-success" : tone === "red" ? "text-error" : "text-foreground";
    return (
        <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-xs">
            <p className="text-xs text-text-body">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p>
        </div>
    );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-text-body">{label}</span>
            <span className={strong ? "font-mono font-semibold tabular-nums" : ""}>{value}</span>
        </div>
    );
}

function Section({
    title,
    hint,
    tone,
    empty,
    bookings,
    render,
}: {
    title: string;
    hint?: string;
    tone: "amber" | "emerald" | "stone";
    empty: string;
    bookings: LxCabinBooking[];
    render: (b: LxCabinBooking) => React.ReactNode;
}) {
    const border =
        tone === "amber"
            ? "border-warning-subtle"
            : tone === "emerald"
              ? "border-success-subtle"
              : "border-border";
    return (
        <div className={`rounded-xl border ${border} bg-card p-4`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">
                    {title} <span className="text-text-body">({bookings.length})</span>
                </h2>
                {hint && <span className="text-[11px] text-text-body">{hint}</span>}
            </div>

            {bookings.length === 0 ? (
                <p className="mt-2 text-sm text-text-body">{empty}</p>
            ) : (
                <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {bookings.map((b) => (
                        <div key={b.id} className="rounded-lg border border-border p-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="font-medium">{b.cabinName}</p>
                                    <p className="text-xs text-text-body">{b.slotLabel}</p>
                                </div>
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase">
                                    {b.bookerType}
                                </span>
                            </div>

                            <div className="mt-2 space-y-1">
                                <Row label="Booked by" value={b.bookedByName ?? b.bookedByRef} />
                                <Row label="Enrollment" value={b.bookedByRef} />
                                {b.contactPhone && <Row label="Phone" value={b.contactPhone} />}
                                <div className="flex items-center justify-between gap-3 text-xs">
                                    <span className="text-text-body">People</span>
                                    <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" /> {b.peopleCount}
                                    </span>
                                </div>
                            </div>

                            {b.groupMembers.length > 0 && (
                                <p className="mt-1.5 text-[11px] text-text-body">
                                    with{" "}
                                    {b.groupMembers
                                        .map((m) => `${m.name} (${m.referenceId})`)
                                        .join(", ")}
                                </p>
                            )}

                            <div className="mt-2 border-t border-border pt-2">{render(b)}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
