"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LxCabinBooking } from "@/features/lx/cabin/types";

const remainingMs = (target: string | null, now: number) =>
    target ? Math.max(0, new Date(target).getTime() - now) : null;

const formatRemaining = (ms: number) => {
    const total = Math.floor(ms / 1000);
    return `${Math.floor(total / 60)}m ${String(total % 60).padStart(2, "0")}s`;
};

type Phase = "upcoming" | "checkIn" | "running";

const COPY: Record<Phase, { heading: string; timerLabel: string }> = {
    upcoming: { heading: "Cabin reserved", timerLabel: "Starts in" },
    checkIn: { heading: "Go to the cabin and check in", timerLabel: "Check in within" },
    running: { heading: "Session in progress", timerLabel: "Time left" },
};

/**
 * The one card that tells a student exactly what to do next, and when it runs out.
 *
 * Three different things can be counting down, and they must not be conflated:
 * before the hour starts you are simply waiting; once it starts you are against
 * the grace period; once checked in you are against the end of the session.
 * Showing "check in within" before the slot has begun would rush people for no
 * reason — that is the bug in the portal this replaces.
 */
export function LiveBookingCard({
    booking,
    busy,
    onAct,
}: {
    booking: LxCabinBooking;
    busy: boolean;
    onAct: (booking: LxCabinBooking, action: "check-out" | "cancel") => void;
}) {
    // The ticking clock IS state. Reading Date.now() during render made the
    // component impure — two renders in the same commit could disagree about
    // which phase the booking is in, and the countdown could jump.
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    const started = now >= new Date(booking.startAt).getTime();
    const phase: Phase =
        booking.status === "CHECKED_IN" ? "running" : started ? "checkIn" : "upcoming";

    const deadline =
        phase === "running"
            ? booking.endAt
            : phase === "checkIn"
              ? booking.checkInDeadline
              : booking.startAt;

    const remaining = remainingMs(deadline, now);
    const expired = remaining === 0;
    const copy = COPY[phase];
    const awaiting = phase !== "running";

    const tone =
        phase === "checkIn"
            ? "border-warning-subtle bg-warning-subtle/70"
            : phase === "running"
              ? "border-success-subtle bg-success-subtle/70"
              : "border-border bg-subtle";

    const timerTone = expired
        ? "text-error"
        : phase === "checkIn"
          ? "text-warning"
          : phase === "running"
            ? "text-success"
            : "text-foreground";

    return (
        <div className={`rounded-2xl border p-5 ${tone}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        {awaiting ? (
                            <AlertTriangle className="h-4 w-4 shrink-0 text-warning-dot" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                        )}
                        <span
                            className={`text-[11px] font-semibold uppercase tracking-wide ${
                                phase === "checkIn"
                                    ? "text-warning"
                                    : phase === "running"
                                      ? "text-success"
                                      : "text-text-body"
                            }`}
                        >
                            {copy.heading}
                        </span>
                    </div>
                    <h3 className="mt-1.5 text-lg font-semibold">{booking.cabinName}</h3>
                    <p className="mt-0.5 text-sm text-text-body">{booking.slotLabel}</p>
                </div>

                <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wide text-text-body">
                        {copy.timerLabel}
                    </p>
                    <p className={`font-mono text-2xl font-semibold tabular-nums ${timerTone}`}>
                        {remaining === null || expired ? "—" : formatRemaining(remaining)}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-text-body">
                <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {booking.peopleCount} {booking.peopleCount === 1 ? "person" : "people"}
                </span>
                {booking.groupMembers.length > 0 && (
                    <span className="min-w-0 truncate">
                        with {booking.groupMembers.map((m) => m.name).join(", ")}
                    </span>
                )}
                <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {booking.status === "CHECKED_IN" ? "Checked in" : "Not yet checked in"}
                </span>
            </div>

            {awaiting && (
                <p className="mt-3 rounded-lg bg-card/70 px-3 py-2 text-xs text-text-body">
                    {phase === "upcoming"
                        ? "The librarian checks you in at the desk. You get 10 minutes from the start of your slot."
                        : "Miss the check-in window and you lose cabin booking for 2 days. The librarian checks you in at the desk."}
                </p>
            )}

            <div className="mt-4">
                <Button
                    variant="outline"
                    className="h-8 rounded-lg text-xs"
                    disabled={busy}
                    onClick={() =>
                        onAct(booking, booking.status === "CHECKED_IN" ? "check-out" : "cancel")
                    }
                >
                    {booking.status === "CHECKED_IN"
                        ? "Leaving early — check out"
                        : "Cancel booking"}
                </Button>
            </div>
        </div>
    );
}
