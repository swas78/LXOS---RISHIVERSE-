"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
    selectClubs,
    selectClubsError,
    selectClubsLoading,
    selectClubsPagination,
} from "@/features/lx/club/clubSelectors";
import { createClubThunk, deleteClubThunk, fetchClubsThunk } from "@/features/lx/club/clubThunks";
import type { CreateLxClubPayload, LxClubCategory } from "@/features/lx/club/types";

export function useClubs() {
    const dispatch = useAppDispatch();
    const clubs = useAppSelector(selectClubs);
    const loading = useAppSelector(selectClubsLoading);
    const error = useAppSelector(selectClubsError);
    const pagination = useAppSelector(selectClubsPagination);

    const [search, setSearchRaw] = useState("");
    const [category, setCategoryRaw] = useState<LxClubCategory | "">("");
    const debouncedSearch = useDebouncedValue(search, 300);

    // Real pagination. These lists used to ask for 60 (or 48) rows in one go
    // and show only a count, so "Showing 1 to 10 of 50" would have been a
    // lie and a long list fetched everything. 10 is core's default page size.
    const [page, setPage] = useState(1);
    const limit = 10;

    const buildParams = () => ({
        search: debouncedSearch || undefined,
        category: category || undefined,
        page,
        limit,
        sortBy: "name" as const,
        sortOrder: "asc" as const,
    });

    useEffect(() => {
        const promise = dispatch(fetchClubsThunk(buildParams()));
        return () => promise.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, debouncedSearch, category, page, limit]);

    // Changing a filter returns to page 1 — staying on page 4 of the previous
    // result set usually lands on nothing. Done in the setter rather than an
    // effect because it is caused by an event, not by state syncing.
    const setSearch = (v: Parameters<typeof setSearchRaw>[0]) => {
        setSearchRaw(v);
        setPage(1);
    };
    const setCategory = (v: Parameters<typeof setCategoryRaw>[0]) => {
        setCategoryRaw(v);
        setPage(1);
    };

    const refresh = () => {
        void dispatch(fetchClubsThunk(buildParams()));
    };

    const createClub = async (payload: CreateLxClubPayload) => {
        const result = await dispatch(createClubThunk(payload));
        return createClubThunk.fulfilled.match(result);
    };

    const removeClub = async (id: string) => {
        const result = await dispatch(deleteClubThunk(id));
        return deleteClubThunk.fulfilled.match(result);
    };

    return {
        page,
        setPage,
        limit,
        clubs,
        loading,
        error,
        pagination,
        search,
        setSearch,
        category,
        setCategory,
        refresh,
        createClub,
        removeClub,
    };
}
