"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
    approveEventThunk,
    completeEventThunk,
    createEventThunk,
    fetchEventsThunk,
} from "@/features/lx/event/eventThunks";
import type { SortDir } from "@/components/ui/table";
import type {
    ApproveEventPayload,
    CreateLxEventPayload,
    LxEventStatus,
    LxEventType,
} from "@/features/lx/event/types";

// Only what the events list endpoint can order by.
type EventSortKey = "title" | "startDate" | "status" | "createdAt";

export function useEvents() {
    const dispatch = useAppDispatch();
    const events = useAppSelector((s) => s.lxEvent.events);
    const loading = useAppSelector((s) => s.lxEvent.loading);
    const error = useAppSelector((s) => s.lxEvent.error);
    const pagination = useAppSelector((s) => s.lxEvent.pagination);
    const actorRole = useAppSelector((s) => s.lxActor.current?.role ?? null);

    const [search, setSearchRaw] = useState("");
    const [type, setTypeRaw] = useState<LxEventType | "">("");
    const [status, setStatusRaw] = useState<LxEventStatus | "">("");
    const debouncedSearch = useDebouncedValue(search, 300);

    // Real pagination. These lists used to ask for 60 (or 48) rows in one go
    // and show only a count, so "Showing 1 to 10 of 50" would have been a
    // lie and a long list fetched everything. 10 is core's default page size.
    const [page, setPage] = useState(1);
    const limit = 10;

    // Server-side, so ordering applies to the whole result set rather than the
    // ten rows currently on screen.
    const [sortBy, setSortBy] = useState<EventSortKey>("startDate");
    const [sortDir, setSortDir] = useState<SortDir>("asc");

    const onSort = (key: string) => {
        const next = key as EventSortKey;
        if (next === sortBy) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortBy(next);
            setSortDir("asc");
        }
        setPage(1);
    };

    const buildParams = () => ({
        search: debouncedSearch || undefined,
        type: type || undefined,
        status: status || undefined,
        page,
        limit,
        sortBy,
        sortOrder: sortDir,
    });

    useEffect(() => {
        const promise = dispatch(fetchEventsThunk(buildParams()));
        return () => promise.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, debouncedSearch, type, status, page, limit, sortBy, sortDir]);

    // Changing a filter returns to page 1 — staying on page 4 of the previous
    // result set usually lands on nothing. Done in the setter rather than an
    // effect because it is caused by an event, not by state syncing.
    const setSearch = (v: Parameters<typeof setSearchRaw>[0]) => {
        setSearchRaw(v);
        setPage(1);
    };
    const setType = (v: Parameters<typeof setTypeRaw>[0]) => {
        setTypeRaw(v);
        setPage(1);
    };
    const setStatus = (v: Parameters<typeof setStatusRaw>[0]) => {
        setStatusRaw(v);
        setPage(1);
    };

    const refresh = () => {
        void dispatch(fetchEventsThunk(buildParams()));
    };

    const createEvent = async (payload: CreateLxEventPayload) => {
        const result = await dispatch(createEventThunk(payload));
        return createEventThunk.fulfilled.match(result);
    };

    const reviewEvent = async (id: string, payload: ApproveEventPayload) => {
        const result = await dispatch(approveEventThunk({ id, payload }));
        return approveEventThunk.fulfilled.match(result);
    };

    const completeEvent = async (id: string) => {
        const result = await dispatch(completeEventThunk(id));
        return completeEventThunk.fulfilled.match(result);
    };

    const canApprove = actorRole === "ADMIN" || actorRole === "LX_TEAM";

    return {
        sortBy,
        sortDir,
        onSort,
        page,
        setPage,
        limit,
        events,
        loading,
        error,
        pagination,
        search,
        setSearch,
        type,
        setType,
        status,
        setStatus,
        canApprove,
        refresh,
        createEvent,
        reviewEvent,
        completeEvent,
    };
}
