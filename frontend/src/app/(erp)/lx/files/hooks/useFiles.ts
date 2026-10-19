"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
    selectFiles,
    selectFilesError,
    selectFilesLoading,
    selectFilesPagination,
} from "@/features/lx/file/fileSelectors";
import { createFileThunk, deleteFileThunk, fetchFilesThunk } from "@/features/lx/file/fileThunks";
import type { CreateLxFilePayload, LxFileType } from "@/features/lx/file/types";
import type { SortDir } from "@/components/ui/table";

// Only what the list endpoint can actually order by — the rest are display-only.
type FileSortKey = "createdAt" | "type" | "originalName" | "size";

export function useFiles() {
    const dispatch = useAppDispatch();
    const files = useAppSelector(selectFiles);
    const loading = useAppSelector(selectFilesLoading);
    const error = useAppSelector(selectFilesError);
    const pagination = useAppSelector(selectFilesPagination);

    const [search, setSearchRaw] = useState("");
    const [type, setTypeRaw] = useState<LxFileType | "">("");
    const debouncedSearch = useDebouncedValue(search, 300);

    // Real pagination. These lists used to ask for 60 (or 48) rows in one go
    // and show only a count, so "Showing 1 to 10 of 50" would have been a
    // lie and a long list fetched everything. 10 is core's default page size.
    const [page, setPage] = useState(1);
    const limit = 10;

    // Sorting is a server concern — ordering only the current page would sort
    // ten rows out of fifty and look broken.
    const [sortBy, setSortBy] = useState<FileSortKey>("createdAt");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const onSort = (key: string) => {
        const next = key as FileSortKey;
        if (next === sortBy) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(next);
            setSortDir("asc");
        }
        setPage(1);
    };

    const buildParams = () => ({
        search: debouncedSearch || undefined,
        type: type || undefined,
        page,
        limit,
        sortBy,
        sortOrder: sortDir,
    });

    useEffect(() => {
        const promise = dispatch(fetchFilesThunk(buildParams()));
        return () => promise.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, debouncedSearch, type, page, limit, sortBy, sortDir]);

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

    const refresh = () => {
        void dispatch(fetchFilesThunk(buildParams()));
    };

    const createFile = async (payload: CreateLxFilePayload) => {
        const result = await dispatch(createFileThunk(payload));
        return createFileThunk.fulfilled.match(result);
    };

    const removeFile = async (id: string) => {
        const result = await dispatch(deleteFileThunk(id));
        return deleteFileThunk.fulfilled.match(result);
    };

    return {
        sortBy,
        sortDir,
        onSort,
        page,
        setPage,
        limit,
        files,
        loading,
        error,
        pagination,
        search,
        setSearch,
        type,
        setType,
        refresh,
        createFile,
        removeFile,
    };
}
