"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { SheetCancelButton, SheetSubmitButton } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { updateRoomThunk } from "@/features/lx/room/roomThunks";
import type { LxRoom, LxRoomAmenity, LxRoomType } from "@/features/lx/room/types";

const TYPES: LxRoomType[] = [
    "CLASSROOM",
    "SEMINAR",
    "LAB",
    "AUDITORIUM",
    "MEETING",
    "STUDIO",
    "OUTDOOR",
    "OTHER",
];
const AMENITIES: LxRoomAmenity[] = [
    "PROJECTOR",
    "WHITEBOARD",
    "AC",
    "SOUND_SYSTEM",
    "MIC",
    "STAGE",
    "WIFI",
    "POWER_OUTLETS",
];

// Admin edit of a room — name, building/floor, capacity, type, amenities, active.
export function EditRoomModal({ room, onClose }: { room: LxRoom; onClose: () => void }) {
    const dispatch = useAppDispatch();
    const [form, setForm] = useState({
        name: room.name,
        building: room.building ?? "",
        floor: room.floor ?? "",
        capacity: String(room.capacity ?? 0),
        type: room.type,
        amenities: new Set<LxRoomAmenity>(room.amenities),
        isActive: room.isActive,
    });
    const [busy, setBusy] = useState(false);
    const field =
        "w-full rounded-input border border-input bg-card px-3 py-2 text-sm text-text-heading outline-none transition-colors placeholder:text-text-placeholder focus:border-border-focus";

    const toggle = (a: LxRoomAmenity) =>
        setForm((f) => {
            const next = new Set(f.amenities);
            if (next.has(a)) next.delete(a);
            else next.add(a);
            return { ...f, amenities: next };
        });

    const save = async () => {
        if (!form.name.trim()) return;
        setBusy(true);
        const res = await dispatch(
            updateRoomThunk({
                id: room.id,
                payload: {
                    name: form.name.trim(),
                    building: form.building.trim() || null,
                    floor: form.floor.trim() || null,
                    capacity: Number(form.capacity) || 0,
                    type: form.type,
                    amenities: [...form.amenities],
                    isActive: form.isActive,
                },
            }),
        );
        setBusy(false);
        if (updateRoomThunk.fulfilled.match(res)) onClose();
    };

    return (
        <Sheet
            open
            onClose={onClose}
            title={<>Edit {room.name}</>}
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
                    placeholder="Room name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-3">
                    <input
                        className={field}
                        placeholder="Building"
                        value={form.building}
                        onChange={(e) => setForm((f) => ({ ...f, building: e.target.value }))}
                    />
                    <input
                        className={field}
                        placeholder="Floor"
                        value={form.floor}
                        onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
                    />
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <label className="text-xs text-text-body">
                        Capacity
                        <input
                            type="number"
                            className={field}
                            value={form.capacity}
                            onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                        />
                    </label>
                    <label className="text-xs text-text-body">
                        Type
                        <select
                            className={field}
                            value={form.type}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, type: e.target.value as LxRoomType }))
                            }
                        >
                            {TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="text-xs text-text-body">
                        Status
                        <select
                            className={field}
                            value={form.isActive ? "yes" : "no"}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, isActive: e.target.value === "yes" }))
                            }
                        >
                            <option value="yes">Available</option>
                            <option value="no">Inactive</option>
                        </select>
                    </label>
                </div>
                <div>
                    <p className="mb-1.5 text-xs text-text-body">Amenities</p>
                    <div className="flex flex-wrap gap-1.5">
                        {AMENITIES.map((a) => {
                            const on = form.amenities.has(a);
                            return (
                                <button
                                    key={a}
                                    type="button"
                                    onClick={() => toggle(a)}
                                    className={`rounded-full px-2.5 py-1 text-xs ${on ? "bg-primary text-primary-foreground" : "border border-border text-text-body hover:bg-subtle"}`}
                                >
                                    {a.replace("_", " ")}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Sheet>
    );
}
