"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Ban, Info, Loader2, Settings2, Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    actOnCabinBookingThunk,
    bookCabinThunk,
    fetchCabinBoardThunk,
} from "@/features/lx/cabin/cabinThunks";
import {
    selectCabinActing,
    selectCabinBoard,
    selectCabinLoading,
    selectMyLiveBookings,
} from "@/features/lx/cabin/cabinSelectors";
import type {
    CreateLxCabinBookingPayload,
    LxCabinBooking,
    LxCabinSlot,
    LxCabinWithSlots,
} from "@/features/lx/cabin/types";
import { useCan } from "@/hooks/useCan";
import { PERMISSIONS } from "@/lib/permissions";
import { LiveBookingCard } from "./components/LiveBookingCard";
import { BookingDialog } from "./components/BookingDialog";

const formatBlockEnd = (expiresAt: string | null | undefined) =>
    expiresAt
        ? `until ${new Date(expiresAt).toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "short",
              timeZone: "Asia/Kolkata",
          })}`
        : "until the library lifts it";

export default function LibraryCabinsPage() {
    const dispatch = useAppDispatch();
    const board = useAppSelector(selectCabinBoard);
    const loading = useAppSelector(selectCabinLoading);
    const acting = useAppSelector(selectCabinActing);
    const liveBookings = useAppSelector(selectMyLiveBookings);
    const { can } = useCan();

    const [picked, setPicked] = useState<{ cabin: LxCabinWithSlots; slot: LxCabinSlot } | null>(
        null,
    );

    const load = useCallback(() => {
        void dispatch(fetchCabinBoardThunk());
    }, [dispatch]);

    useEffect(() => {
        load();
    }, [load]);

    // Slots expire on the clock, so the board refreshes itself while it is open —
    // otherwise a student stares at a slot that quietly stopped being bookable.
    useEffect(() => {
        const id = setInterval(load, 30000);
        return () => clearInterval(id);
    }, [load]);

    const confirmBooking = async (payload: CreateLxCabinBookingPayload) => {
        const result = await dispatch(bookCabinThunk(payload));
        if (bookCabinThunk.rejected.match(result)) return result.payload as string;
        setPicked(null);
        load();
        return null;
    };

    const act = async (booking: LxCabinBooking, action: "check-out" | "cancel") => {
        await dispatch(actOnCabinBookingThunk({ id: booking.id, action }));
        load();
    };

    if (loading && !board) {
        return (
            <div className="flex items-center gap-2 py-16 text-sm text-text-body">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading cabins…
            </div>
        );
    }

    const identity = board?.identity;
    const eligibility = board?.eligibility;
    const canBook = Boolean(eligibility?.canBook);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-primary-text">Study Cabins</h1>
                    <p className="mt-1 text-sm text-text-body">
                        Ashok Goel Library · book a cabin for your study group. One hour at a time,
                        today only.
                    </p>
                </div>
                {can(PERMISSIONS.MANAGE_LIBRARY_CABINS) && (
                    <Link
                        href="/lx/library/desk"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-card border border-border px-3 py-2 text-sm font-medium transition hover:bg-subtle"
                    >
                        <Settings2 className="h-4 w-4" /> Library desk
                    </Link>
                )}
            </div>

            {liveBookings.map((booking) => (
                <LiveBookingCard key={booking.id} booking={booking} busy={acting} onAct={act} />
            ))}

            {/* Running out of slots is ordinary; being blocked is not. They must not
          look the same, or a normal day reads like a punishment. */}
            {!canBook && eligibility?.reason === "DAILY_LIMIT" && (
                <div className="flex items-start gap-3 rounded-xl border border-border bg-subtle p-4">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-text-body" />
                    <p className="text-sm text-text-body">{eligibility.message}</p>
                </div>
            )}

            {!canBook && eligibility && eligibility.reason !== "DAILY_LIMIT" && (
                <div className="flex items-start gap-3 rounded-xl border border-error-subtle bg-error-subtle/70 p-4">
                    <Ban className="mt-0.5 h-4 w-4 shrink-0 text-error" />
                    <div>
                        <p className="text-sm font-medium text-error">{eligibility.message}</p>
                        {eligibility.block && (
                            <p className="mt-1 text-xs text-error/80">
                                Paused {formatBlockEnd(eligibility.block.expiresAt)}.
                                {eligibility.block.isPermanent &&
                                    " Meet the library team to appeal."}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {canBook &&
                identity?.bookerType === "STUDENT" &&
                eligibility?.remainingToday !== null && (
                    <p className="flex items-center gap-1.5 text-xs text-text-body">
                        <Info className="h-3.5 w-3.5" />
                        {eligibility?.remainingToday} of {board?.rules.studentMaxBookingsPerDay}{" "}
                        slots left today · one hour each
                    </p>
                )}

            {canBook && identity?.bookerType === "FACULTY" && (
                <p className="flex items-center gap-1.5 text-xs text-text-body">
                    <Info className="h-3.5 w-3.5" />
                    Booking as faculty — no daily limit, and group minimums do not apply.
                </p>
            )}

            <div className="space-y-4">
                {board?.cabins.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-text-body">
                        No cabins have been set up yet.
                    </div>
                )}

                {board?.cabins.map((cabin) => (
                    <div key={cabin.id} className="rounded-2xl border border-border bg-card p-5">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h3 className="font-semibold">{cabin.name}</h3>
                                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-text-body">
                                    <Users className="h-3 w-3" />
                                    {cabin.minCapacity}-{cabin.maxCapacity} people
                                    {cabin.floor && <span>· {cabin.floor}</span>}
                                </p>
                            </div>
                            {cabin.isActive ? (
                                <span
                                    className={`text-[11px] font-medium ${
                                        cabin.freeSlotCount > 0 ? "text-success" : "text-text-body"
                                    }`}
                                >
                                    {cabin.freeSlotCount > 0
                                        ? `${cabin.freeSlotCount} slots free`
                                        : "Fully booked"}
                                </span>
                            ) : (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-text-body">
                                    {cabin.unavailableReason ?? "Out of service"}
                                </span>
                            )}
                        </div>

                        {/* Tapping a time books that time. There is no separate "pick a
                slot" step, because the slot is the thing being chosen. */}
                        <div className="flex flex-wrap gap-1.5">
                            {cabin.slots.map((slot) => {
                                const selectable = slot.status === "FREE" && canBook;
                                return (
                                    <button
                                        key={slot.slotStart}
                                        type="button"
                                        disabled={!selectable}
                                        onClick={() => setPicked({ cabin, slot })}
                                        className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition ${
                                            slot.status === "PAST"
                                                ? "border-border/60 text-text-body/50 line-through"
                                                : slot.status === "TAKEN"
                                                  ? "border-border bg-subtle text-text-body"
                                                  : selectable
                                                    ? "border-border hover:border-primary hover:bg-primary hover:text-primary-foreground"
                                                    : "border-border/60 text-text-body"
                                        }`}
                                    >
                                        {slot.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {picked && identity && (
                <BookingDialog
                    cabin={picked.cabin}
                    slot={picked.slot}
                    identity={identity}
                    onClose={() => setPicked(null)}
                    onConfirm={confirmBooking}
                />
            )}
        </div>
    );
}
