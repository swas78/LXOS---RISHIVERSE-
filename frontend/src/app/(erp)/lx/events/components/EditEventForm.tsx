"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { SheetCancelButton, SheetSubmitButton } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { updateEventThunk } from "@/features/lx/event/eventThunks";
import type { LxEvent } from "@/features/lx/event/types";

// Admin edit of an event — title, description, budgets (allocated & used),
// attendees and venue. (Status changes go through approve / complete.)
export function EditEventForm({ event, onClose }: { event: LxEvent; onClose: () => void }) {
    const dispatch = useAppDispatch();
    const [form, setForm] = useState({
        title: event.title,
        description: event.description,
        budgetAllocated: String(event.budgetAllocated ?? 0),
        budgetSpent: String(event.budgetSpent ?? 0),
        attendees: String(event.attendees ?? 0),
        location: event.location ?? "",
    });
    const [busy, setBusy] = useState(false);
    const field =
        "w-full rounded-input border border-input bg-card px-3 py-2 text-sm text-text-heading outline-none transition-colors placeholder:text-text-placeholder focus:border-border-focus";

    const save = async () => {
        if (!form.title.trim()) return;
        setBusy(true);
        const res = await dispatch(
            updateEventThunk({
                id: event.id,
                payload: {
                    title: form.title.trim(),
                    description: form.description.trim(),
                    budgetAllocated: Number(form.budgetAllocated) || 0,
                    budgetSpent: Number(form.budgetSpent) || 0,
                    attendees: Number(form.attendees) || 0,
                    location: form.location.trim(),
                },
            }),
        );
        setBusy(false);
        if (updateEventThunk.fulfilled.match(res)) onClose();
    };

    return (
        <Sheet
            open
            onClose={onClose}
            title="Edit event"
            footer={
                <>
                    <SheetCancelButton onClick={onClose}>Cancel</SheetCancelButton>
                    <SheetSubmitButton onClick={save} disabled={busy}>
                        {busy ? "Saving…" : "Save changes"}
                    </SheetSubmitButton>
                </>
            }
        >
            <div className="space-y-3">
                <input
                    className={field}
                    placeholder="Title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
                <textarea
                    className={field}
                    rows={2}
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs text-text-body">
                        Budget allocated (₹)
                        <input
                            type="number"
                            className={field}
                            value={form.budgetAllocated}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, budgetAllocated: e.target.value }))
                            }
                        />
                    </label>
                    <label className="text-xs text-text-body">
                        Used / spent (₹)
                        <input
                            type="number"
                            className={field}
                            value={form.budgetSpent}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, budgetSpent: e.target.value }))
                            }
                        />
                    </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs text-text-body">
                        Attendees
                        <input
                            type="number"
                            className={field}
                            value={form.attendees}
                            onChange={(e) => setForm((f) => ({ ...f, attendees: e.target.value }))}
                        />
                    </label>
                    <label className="text-xs text-text-body">
                        Venue / location
                        <input
                            className={field}
                            value={form.location}
                            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                        />
                    </label>
                </div>
            </div>
        </Sheet>
    );
}
