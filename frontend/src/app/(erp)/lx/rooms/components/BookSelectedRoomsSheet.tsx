"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { SheetCancelButton, SheetSubmitButton } from "@/components/ui/button";
import { roomBookingApi, type RoomWithAvailability } from "@/features/lx/room/roomApi";

const fieldClass =
    "w-full rounded-input border border-input bg-card px-3 py-2 text-sm text-text-heading outline-none transition-colors placeholder:text-text-placeholder focus:border-border-focus";

/**
 * Confirm a booking for the rooms already chosen on the availability screen.
 *
 * The time was settled before any room was picked, so it is shown here as a
 * fact rather than re-asked. Only the reason is still missing.
 */
export function BookSelectedRoomsSheet({
    rooms,
    startTime,
    endTime,
    onClose,
    onBooked,
}: {
    rooms: RoomWithAvailability[];
    startTime: string;
    endTime: string;
    onClose: () => void;
    onBooked: () => void;
}) {
    const [title, setTitle] = useState("");
    const [purpose, setPurpose] = useState("");
    const [busy, setBusy] = useState(false);
    const [taken, setTaken] = useState<{ roomName: string }[] | null>(null);

    const when = new Date(startTime);
    const until = new Date(endTime);
    const fmt = (d: Date) =>
        d.toLocaleString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
        });

    const submit = async () => {
        if (!title.trim()) {
            toast.error("Give the booking a title.");
            return;
        }
        setBusy(true);
        setTaken(null);
        try {
            const res = await roomBookingApi.createMany({
                roomIds: rooms.map((r) => r.id),
                title: title.trim(),
                purpose: purpose.trim(),
                startTime,
                endTime,
            });
            toast.success(res.message);
            onBooked();
            onClose();
        } catch (err) {
            const body = (
                err as {
                    response?: {
                        data?: { message?: string; unavailable?: { roomName: string }[] };
                    };
                }
            )?.response?.data;
            // All-or-nothing: if anything went while the form was open, nothing
            // was created, so name what to drop rather than half-booking.
            if (body?.unavailable?.length) setTaken(body.unavailable);
            toast.error(body?.message || "Could not request the booking");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Sheet
            open
            onClose={onClose}
            title={rooms.length === 1 ? `Book ${rooms[0].name}` : `Book ${rooms.length} rooms`}
            description="The time you picked is carried over — only the reason is needed."
            footer={
                <>
                    <SheetCancelButton onClick={onClose}>Cancel</SheetCancelButton>
                    <SheetSubmitButton onClick={submit} disabled={busy}>
                        {busy ? "Requesting…" : "Request booking"}
                    </SheetSubmitButton>
                </>
            }
        >
            <div className="space-y-4">
                <div className="flex items-start gap-2 rounded-card border border-border bg-subtle px-3 py-2.5">
                    <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-icon-secondary" />
                    <div className="text-sm">
                        <p className="font-medium text-text-heading">{fmt(when)}</p>
                        <p className="text-text-body">until {fmt(until)}</p>
                    </div>
                </div>

                <div>
                    <p className="mb-1.5 text-xs font-medium text-text-subheading">
                        {rooms.length === 1 ? "Room" : `${rooms.length} rooms`}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {rooms.map((r) => (
                            <span
                                key={r.id}
                                className="rounded-full bg-primary-subtle px-2.5 py-1 text-xs font-medium text-primary-subtle-foreground"
                            >
                                {r.name}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-text-subheading">
                        Title <span className="text-error">*</span>
                    </label>
                    <input
                        className={fieldClass}
                        placeholder="e.g. Robotics club weekly sync"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-text-subheading">
                        Purpose
                    </label>
                    <textarea
                        className={fieldClass}
                        rows={3}
                        placeholder="What is the space for? (optional)"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                    />
                </div>

                {taken && (
                    <div className="rounded-card border border-error-subtle bg-error-subtle p-3">
                        <p className="text-sm font-medium text-error-subtle-foreground">
                            Taken while this was open — nothing was booked
                        </p>
                        <ul className="mt-1 list-inside list-disc text-xs text-error-subtle-foreground">
                            {taken.map((u) => (
                                <li key={u.roomName}>{u.roomName}</li>
                            ))}
                        </ul>
                        <p className="mt-1.5 text-xs text-error-subtle-foreground">
                            Close this and refresh availability to pick again.
                        </p>
                    </div>
                )}
            </div>
        </Sheet>
    );
}
