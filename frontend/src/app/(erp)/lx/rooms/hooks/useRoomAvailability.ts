"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { roomBookingApi, type RoomWithAvailability } from "@/features/lx/room/roomApi";
import { useAppDispatch } from "@/store/hooks";
import { deleteRoomThunk } from "@/features/lx/room/roomThunks";

/** `datetime-local` value for `Date`, in the browser's own timezone. */
const toLocalInput = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Next whole hour — a sensible default so the page is useful before any input. */
const defaultWindow = () => {
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return { start: toLocalInput(start), end: toLocalInput(end) };
};

/**
 * Availability-first room search.
 *
 * The window drives the list, not the other way round: whenever start, end or
 * the filters change, this re-asks the server which rooms are actually free.
 * Requests are debounced and aborted, because typing into a `datetime-local`
 * fires on every keystroke and the stale replies would otherwise race.
 */
/*
 * `type` is a plain string, NOT an array. An array built at the call site
 * (`type ? [type] : []`) is a new reference on every render, which flows into
 * `load`'s dependencies, which re-runs the effect, which sets state, which
 * renders again — a re-fetch loop. Measured before this changed: 14 requests
 * in 5 seconds on an idle page.
 */
export function useRoomAvailability({ search, type }: { search: string; type: string }) {
    const [{ start, end }, setWindowValue] = useState(defaultWindow);
    const [rooms, setRooms] = useState<RoomWithAvailability[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const dispatch = useAppDispatch();

    const setStart = useCallback((value: string) => {
        setWindowValue((w) => {
            // Keep the window's length when the start moves, so nudging the
            // start does not silently create a negative range.
            const prevStart = new Date(w.start).getTime();
            const prevEnd = new Date(w.end).getTime();
            const span =
                Number.isFinite(prevStart) && prevEnd > prevStart ? prevEnd - prevStart : 3600000;
            const nextStart = new Date(value).getTime();
            if (!Number.isFinite(nextStart)) return { ...w, start: value };
            return { start: value, end: toLocalInput(new Date(nextStart + span)) };
        });
    }, []);

    const setEnd = useCallback(
        (value: string) => setWindowValue((w) => ({ ...w, end: value })),
        [],
    );

    const invalidWindow = useMemo(() => {
        const s = new Date(start).getTime();
        const e = new Date(end).getTime();
        if (!Number.isFinite(s) || !Number.isFinite(e)) return "Pick a start and end time.";
        if (e <= s) return "End time must be after the start time.";
        return null;
    }, [start, end]);

    const load = useCallback(async () => {
        if (invalidWindow) {
            setRooms([]);
            return;
        }
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);
        setError(null);
        try {
            const res = await roomBookingApi.availabilityFor(
                {
                    startTime: new Date(start).toISOString(),
                    endTime: new Date(end).toISOString(),
                    ...(search ? { search } : {}),
                    ...(type ? { type: [type] } : {}),
                },
                controller.signal,
            );
            setRooms(res.data ?? []);
        } catch (err) {
            if ((err as { code?: string })?.code === "ERR_CANCELED") return;
            setError(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                    "Could not check availability",
            );
            setRooms([]);
        } finally {
            if (abortRef.current === controller) setLoading(false);
        }
    }, [start, end, search, type, invalidWindow]);

    useEffect(() => {
        const t = setTimeout(() => void load(), 300);
        return () => clearTimeout(t);
    }, [load]);

    useEffect(() => () => abortRef.current?.abort(), []);

    // Room management still lives on this screen, so removal goes through the
    // same thunk the old list used and then re-asks for availability.
    const removeRoom = useCallback(
        async (id: string) => {
            const result = await dispatch(deleteRoomThunk(id));
            const ok = deleteRoomThunk.fulfilled.match(result);
            if (ok) await load();
            return ok;
        },
        [dispatch, load],
    );

    const available = useMemo(() => rooms.filter((r) => r.available), [rooms]);
    const taken = useMemo(() => rooms.filter((r) => !r.available), [rooms]);

    return {
        start,
        end,
        setStart,
        setEnd,
        invalidWindow,
        rooms,
        available,
        taken,
        loading,
        error,
        reload: load,
        removeRoom,
    };
}
