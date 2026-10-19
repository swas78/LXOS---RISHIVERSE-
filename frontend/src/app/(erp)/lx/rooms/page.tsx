"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Pencil, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomFilters } from "./components/RoomFilters";
import { CreateRoomModal } from "./components/CreateRoomModal";
import { EditRoomModal } from "./components/EditRoomModal";
import { BookSelectedRoomsSheet } from "./components/BookSelectedRoomsSheet";
import { useRoomAvailability } from "./hooks/useRoomAvailability";
import { useCan } from "@/hooks/useCan";
import { PERMISSIONS } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { RoomWithAvailability } from "@/features/lx/room/roomApi";
import type { LxRoomType } from "@/features/lx/room/types";

const fieldClass =
    "w-full rounded-input border border-input bg-card px-3 py-2 text-sm text-text-heading outline-none transition-colors focus:border-border-focus";

/**
 * Rooms, asked the way people actually think about them.
 *
 * The old page listed every room and only told you it was taken after you had
 * picked one and filled in a form. This asks for the time first, then shows
 * what is genuinely free for it — counting both existing bookings and
 * scheduled events, which previously could not see each other. Several rooms
 * can be claimed in one request, because "I need three rooms for this session"
 * is one intention, not three.
 */
export default function RoomsPage() {
    const { can } = useCan();
    const canManage = can(PERMISSIONS.MANAGE_ROOMS);
    const canBook = can(PERMISSIONS.BOOK_ROOM);

    const [search, setSearch] = useState("");
    const [type, setType] = useState<"" | LxRoomType>("");
    const [creating, setCreating] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [booking, setBooking] = useState(false);
    const [editingRoom, setEditingRoom] = useState<RoomWithAvailability | null>(null);

    const {
        start,
        end,
        setStart,
        setEnd,
        invalidWindow,
        available,
        taken,
        loading,
        error,
        reload,
        removeRoom,
    } = useRoomAvailability({ search, type });

    // A room that gets taken while it is selected must not stay selected.
    const selectedRooms = useMemo(
        () => available.filter((r) => selected.includes(r.id)),
        [available, selected],
    );

    const handleDelete = (room: RoomWithAvailability) => {
        if (window.confirm(`Remove “${room.name}”? It will no longer be bookable.`)) {
            setSelected((cur) => cur.filter((id) => id !== room.id));
            void removeRoom(room.id);
        }
    };

    const toggle = (room: RoomWithAvailability) =>
        setSelected((cur) =>
            cur.includes(room.id) ? cur.filter((id) => id !== room.id) : [...cur, room.id],
        );

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary-text">Rooms</h1>
                    <p className="mt-1 text-sm text-text-body">
                        Tell us when you need a space — we&apos;ll show what&apos;s free.
                    </p>
                </div>
                {canManage && (
                    <Button className="shrink-0 gap-1.5" onClick={() => setCreating(true)}>
                        <Plus className="h-4 w-4" /> New Room
                    </Button>
                )}
            </div>

            {/* The window drives everything below it. */}
            <div className="rounded-card border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-icon-secondary" />
                    <p className="text-sm font-medium text-text-heading">When do you need it?</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block">
                        <span className="mb-1 block text-xs font-medium text-text-subheading">
                            From
                        </span>
                        <input
                            type="datetime-local"
                            className={fieldClass}
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                        />
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-xs font-medium text-text-subheading">
                            Until
                        </span>
                        <input
                            type="datetime-local"
                            className={fieldClass}
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                        />
                    </label>
                </div>
                {invalidWindow && <p className="mt-2 text-xs text-error">{invalidWindow}</p>}
            </div>

            <RoomFilters
                search={search}
                setSearch={setSearch}
                type={type}
                setType={setType}
                total={available.length}
            />

            {error && <p className="text-sm text-error">{error}</p>}

            {!invalidWindow && (
                <>
                    {loading && available.length === 0 && taken.length === 0 && (
                        <p className="text-sm text-text-body">Checking availability…</p>
                    )}

                    {/* ---------------- Free ---------------- */}
                    {available.length > 0 && (
                        <section>
                            <div className="mb-3 flex items-center gap-2">
                                <h2 className="text-base font-semibold text-text-heading">
                                    Free rooms
                                </h2>
                                <Badge tone="success" dot>
                                    {available.length} available
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {available.map((room) => {
                                    const isSelected = selected.includes(room.id);
                                    return (
                                        <div
                                            key={room.id}
                                            className={cn(
                                                "flex flex-col rounded-card border p-4 transition-colors",
                                                isSelected
                                                    ? "border-primary bg-primary-subtle"
                                                    : "border-border bg-card",
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-text-heading">
                                                        {room.name}
                                                    </p>
                                                    <p className="mt-0.5 truncate text-xs text-text-body">
                                                        {[room.building, room.floor]
                                                            .filter(Boolean)
                                                            .join(" · ") || room.type}
                                                    </p>
                                                </div>
                                                <Badge tone="success">Available</Badge>
                                            </div>

                                            <div className="mt-3 flex items-center gap-1.5 text-xs text-text-body">
                                                <Users className="h-3.5 w-3.5" />
                                                Seats {room.capacity ?? "—"}
                                            </div>

                                            {/* An explicit control, not a clickable card —
                                                a card that silently toggles gives no clue
                                                that it is a choice. */}
                                            {canBook && (
                                                <button
                                                    type="button"
                                                    onClick={() => toggle(room)}
                                                    aria-pressed={isSelected}
                                                    className={cn(
                                                        "mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-card text-sm font-medium transition-colors",
                                                        isSelected
                                                            ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                                                            : "border border-input text-text-subheading hover:bg-subtle",
                                                    )}
                                                >
                                                    {isSelected ? (
                                                        <>
                                                            <Check className="h-4 w-4" /> Selected
                                                        </>
                                                    ) : (
                                                        "Select"
                                                    )}
                                                </button>
                                            )}

                                            {canManage && (
                                                <div className="mt-3 flex items-center gap-1 border-t border-border pt-2">
                                                    <button
                                                        type="button"
                                                        title={`Edit ${room.name}`}
                                                        onClick={() => setEditingRoom(room)}
                                                        className="rounded-full p-1.5 text-icon-secondary hover:bg-ghost-hover hover:text-icon-primary"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title={`Remove ${room.name}`}
                                                        onClick={() => handleDelete(room)}
                                                        className="rounded-full p-1.5 text-icon-secondary hover:bg-error-subtle hover:text-error"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {available.length === 0 && !loading && (
                        <p className="rounded-card border border-dashed border-border p-6 text-center text-sm text-text-body">
                            Nothing is free in that window. Try a different time.
                        </p>
                    )}

                    {/* ---------------- Taken ---------------- */}
                    {taken.length > 0 && (
                        <section>
                            <div className="mb-3 flex items-center gap-2">
                                <h2 className="text-base font-semibold text-text-heading">
                                    Already booked
                                </h2>
                                <Badge tone="error" dot>
                                    {taken.length} unavailable
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {taken.map((room) => (
                                    <div
                                        key={room.id}
                                        className="flex flex-col rounded-card border border-error-subtle bg-error-subtle/40 p-4"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-text-heading">
                                                    {room.name}
                                                </p>
                                                <p className="mt-0.5 truncate text-xs text-text-body">
                                                    {[room.building, room.floor]
                                                        .filter(Boolean)
                                                        .join(" · ") || room.type}
                                                </p>
                                            </div>
                                            <Badge tone="error">Booked</Badge>
                                        </div>

                                        {/* Say WHAT holds it — an event and a booking are
                                            different things to chase down. */}
                                        <ul className="mt-3 space-y-1">
                                            {room.conflicts.map((c) => (
                                                <li key={c.id} className="text-xs text-text-body">
                                                    <span className="font-medium text-text-subheading">
                                                        {c.source === "EVENT" ? "Event" : "Booking"}
                                                    </span>
                                                    {" · "}
                                                    {c.title}
                                                </li>
                                            ))}
                                        </ul>

                                        {canManage && (
                                            <div className="mt-3 flex items-center gap-1 border-t border-error-subtle pt-2">
                                                <button
                                                    type="button"
                                                    title={`Edit ${room.name}`}
                                                    onClick={() => setEditingRoom(room)}
                                                    className="rounded-full p-1.5 text-icon-secondary hover:bg-ghost-hover hover:text-icon-primary"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title={`Remove ${room.name}`}
                                                    onClick={() => handleDelete(room)}
                                                    className="rounded-full p-1.5 text-icon-secondary hover:bg-error-subtle hover:text-error"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}

            {/* Sticky action bar — the selection is only actionable together. */}
            {selectedRooms.length > 0 && (
                <div className="sticky bottom-4 z-30 flex items-center justify-between gap-3 rounded-full border border-border bg-card px-4 py-2.5 shadow-md">
                    <p className="text-sm text-text-body">
                        <span className="font-medium text-text-heading">
                            {selectedRooms.length}
                        </span>{" "}
                        {selectedRooms.length === 1 ? "room" : "rooms"} selected
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setSelected([])}
                            className="rounded-full px-3 py-1.5 text-sm text-text-body hover:bg-ghost-hover"
                        >
                            Clear
                        </button>
                        <Button size="sm" onClick={() => setBooking(true)}>
                            Book{" "}
                            {selectedRooms.length === 1 ? "room" : `${selectedRooms.length} rooms`}
                        </Button>
                    </div>
                </div>
            )}

            {creating && <CreateRoomModal onClose={() => setCreating(false)} />}

            {editingRoom && (
                <EditRoomModal
                    room={editingRoom}
                    onClose={() => {
                        setEditingRoom(null);
                        void reload();
                    }}
                />
            )}

            {booking && selectedRooms.length > 0 && (
                <BookSelectedRoomsSheet
                    rooms={selectedRooms}
                    startTime={new Date(start).toISOString()}
                    endTime={new Date(end).toISOString()}
                    onClose={() => setBooking(false)}
                    onBooked={() => {
                        setSelected([]);
                        void reload();
                    }}
                />
            )}
        </div>
    );
}
