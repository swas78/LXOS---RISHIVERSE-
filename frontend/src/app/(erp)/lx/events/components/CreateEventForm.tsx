"use client";

import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { SheetCancelButton, SheetSubmitButton } from "@/components/ui/button";
import type { CreateLxEventPayload, LxEventType } from "@/features/lx/event/types";
import { eventApi } from "@/features/lx/event/eventApi";
import { clubApi } from "@/features/lx/club/clubApi";
import { clanApi } from "@/features/lx/clan/clanApi";
import { roomApi } from "@/features/lx/room/roomApi";

type Lite = { id: string; name: string };
type RoomLite = { id: string; name: string };

type Props = {
    open: boolean;
    onClose: () => void;
    onCreate: (payload: CreateLxEventPayload) => Promise<boolean>;
};

const TYPES: LxEventType[] = ["CLUB", "CLAN", "LX", "FEST"];

export function CreateEventForm({ open, onClose, onCreate }: Props) {
    const [clubs, setClubs] = useState<Lite[]>([]);
    const [clans, setClans] = useState<Lite[]>([]);
    const [rooms, setRooms] = useState<RoomLite[]>([]);
    const [busy, setBusy] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        type: "CLUB" as LxEventType,
        clubId: "",
        clanId: "",
        startDate: "",
        endDate: "",
        roomIds: [] as string[],
        location: "",
        budgetAllocated: "",
        attendees: "",
    });

    useEffect(() => {
        if (!open) return;
        // Picker lookups go through the feature Apis, not raw axios. limit 100 is
        // core's cap and is correct here: a <select> needs the whole list, unlike a
        // paginated table.
        clubApi
            .getAll({ limit: 100 })
            .then((r) => setClubs(r.data))
            .catch(() => {});
        clanApi
            .getAll({ limit: 100 })
            .then((r) => setClans(r.data))
            .catch(() => {});
        roomApi
            .getAll({ limit: 100 })
            .then((r) => setRooms(r.data))
            .catch(() => {});
    }, [open]);

    if (!open) return null;

    const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
        setForm((f) => ({ ...f, [k]: v }));

    const toggleRoom = (id: string) =>
        setForm((f) => ({
            ...f,
            roomIds: f.roomIds.includes(id)
                ? f.roomIds.filter((r) => r !== id)
                : [...f.roomIds, id],
        }));

    const submit = async () => {
        if (!form.title.trim() || !form.description.trim() || !form.startDate || !form.endDate) {
            toast.error("Fill in title, description, and dates.");
            return;
        }
        if (new Date(form.endDate) < new Date(form.startDate)) {
            toast.error("End date must be on or after start date.");
            return;
        }
        if (form.type === "CLUB" && !form.clubId) return toast.error("Select a club.");
        if (form.type === "CLAN" && !form.clanId) return toast.error("Select a clan.");

        setBusy(true);
        try {
            // Availability check first.
            if (form.roomIds.length > 0) {
                const data = await eventApi.checkAvailability({
                    roomIds: form.roomIds,
                    startDate: form.startDate,
                    endDate: form.endDate,
                });
                if (!data.available) {
                    const names = (data.conflicts || [])
                        .map((c: { title: string }) => c.title)
                        .join(", ");
                    toast.error(`Room not available — conflicts with: ${names || "another event"}`);
                    setBusy(false);
                    return;
                }
            }

            const club = clubs.find((c) => c.id === form.clubId);
            const clan = clans.find((c) => c.id === form.clanId);
            const roomNames = rooms.filter((r) => form.roomIds.includes(r.id)).map((r) => r.name);

            const payload: CreateLxEventPayload = {
                title: form.title.trim(),
                description: form.description.trim(),
                type: form.type,
                clubId: form.type === "CLUB" ? form.clubId : null,
                clubName: form.type === "CLUB" ? (club?.name ?? null) : null,
                clanId: form.type === "CLAN" ? form.clanId : null,
                clanName: form.type === "CLAN" ? (clan?.name ?? null) : null,
                startDate: new Date(form.startDate).toISOString(),
                endDate: new Date(form.endDate).toISOString(),
                roomIds: form.roomIds,
                roomNames,
                location: form.location.trim(),
                budgetAllocated: form.budgetAllocated ? Number(form.budgetAllocated) : 0,
                attendees: form.attendees ? Number(form.attendees) : 0,
            };
            const ok = await onCreate(payload);
            if (ok) {
                onClose();
                setForm({
                    title: "",
                    description: "",
                    type: "CLUB",
                    clubId: "",
                    clanId: "",
                    startDate: "",
                    endDate: "",
                    roomIds: [],
                    location: "",
                    budgetAllocated: "",
                    attendees: "",
                });
            }
        } finally {
            setBusy(false);
        }
    };

    const field =
        "w-full rounded-input border border-input bg-card px-3 py-2 text-sm text-text-heading outline-none transition-colors placeholder:text-text-placeholder focus:border-border-focus";

    return (
        <Sheet
            open
            onClose={onClose}
            title="New Event"
            footer={
                <>
                    <SheetCancelButton onClick={onClose}>Cancel</SheetCancelButton>
                    <SheetSubmitButton onClick={submit} disabled={busy} className="gap-1.5">
                        <Plus className="h-4 w-4" /> {busy ? "Checking…" : "Create Event"}
                    </SheetSubmitButton>
                </>
            }
        >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                    className={`${field} sm:col-span-2`}
                    placeholder="Event title"
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                />
                <textarea
                    className={`${field} sm:col-span-2`}
                    rows={2}
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                />

                <label className="text-xs text-text-body">
                    Type
                    <select
                        className={field}
                        value={form.type}
                        onChange={(e) => set("type", e.target.value as LxEventType)}
                    >
                        {TYPES.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </label>

                {form.type === "CLUB" && (
                    <label className="text-xs text-text-body">
                        Club
                        <select
                            className={field}
                            value={form.clubId}
                            onChange={(e) => set("clubId", e.target.value)}
                        >
                            <option value="">Select club…</option>
                            {clubs.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                {form.type === "CLAN" && (
                    <label className="text-xs text-text-body">
                        Clan
                        <select
                            className={field}
                            value={form.clanId}
                            onChange={(e) => set("clanId", e.target.value)}
                        >
                            <option value="">Select clan…</option>
                            {clans.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </label>
                )}

                <label className="text-xs text-text-body">
                    Starts
                    <input
                        type="datetime-local"
                        className={field}
                        value={form.startDate}
                        onChange={(e) => set("startDate", e.target.value)}
                    />
                </label>
                <label className="text-xs text-text-body">
                    Ends
                    <input
                        type="datetime-local"
                        className={field}
                        value={form.endDate}
                        onChange={(e) => set("endDate", e.target.value)}
                    />
                </label>

                <label className="text-xs text-text-body">
                    Budget (₹)
                    <input
                        type="number"
                        className={field}
                        value={form.budgetAllocated}
                        onChange={(e) => set("budgetAllocated", e.target.value)}
                    />
                </label>
                <label className="text-xs text-text-body">
                    Expected attendees
                    <input
                        type="number"
                        className={field}
                        value={form.attendees}
                        onChange={(e) => set("attendees", e.target.value)}
                    />
                </label>

                <label className="text-xs text-text-body sm:col-span-2">
                    Free-text venue (optional if rooms chosen)
                    <input
                        className={field}
                        placeholder="e.g. Sports Ground"
                        value={form.location}
                        onChange={(e) => set("location", e.target.value)}
                    />
                </label>
            </div>

            <div className="mt-3">
                <p className="mb-1.5 text-xs text-text-body">
                    Rooms (availability is checked on submit)
                </p>
                <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto rounded-card border border-border p-2">
                    {rooms.map((r) => {
                        const on = form.roomIds.includes(r.id);
                        return (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => toggleRoom(r.id)}
                                className={`rounded-full px-2.5 py-1 text-xs ${on ? "bg-primary text-primary-foreground" : "border border-border text-text-body hover:bg-subtle"}`}
                            >
                                {r.name}
                            </button>
                        );
                    })}
                </div>
            </div>
        </Sheet>
    );
}
