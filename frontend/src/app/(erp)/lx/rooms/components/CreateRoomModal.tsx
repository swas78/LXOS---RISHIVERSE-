"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { SheetCancelButton, SheetSubmitButton } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { createRoomThunk } from "@/features/lx/room/roomThunks";
import type { LxRoomAmenity, LxRoomType } from "@/features/lx/room/types";

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

// Admin: add a new bookable room.
export function CreateRoomModal({ onClose }: { onClose: () => void }) {
    const dispatch = useAppDispatch();
    const [form, setForm] = useState({
        name: "",
        building: "",
        floor: "",
        capacity: "40",
        type: "CLASSROOM" as LxRoomType,
        amenities: new Set<LxRoomAmenity>(["PROJECTOR", "WHITEBOARD", "AC"]),
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
            createRoomThunk({
                name: form.name.trim(),
                building: form.building.trim() || null,
                floor: form.floor.trim() || null,
                capacity: Number(form.capacity) || 0,
                type: form.type,
                amenities: [...form.amenities],
                isActive: true,
            }),
        );
        setBusy(false);
        if (createRoomThunk.fulfilled.match(res)) onClose();
    };

    return (
        <Sheet
            open
            onClose={onClose}
            title="New room"
            footer={
                <>
                    <SheetCancelButton onClick={onClose}>Cancel</SheetCancelButton>
                    <SheetSubmitButton onClick={save} disabled={busy}>
                        {busy ? "Adding…" : "Add room"}
                    </SheetSubmitButton>
                </>
            }
        >
            <div className="space-y-3">
                <input
                    className={field}
                    placeholder="Room name (e.g. A-511)"
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
                <div className="grid grid-cols-2 gap-3">
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
