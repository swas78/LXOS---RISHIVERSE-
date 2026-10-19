import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { createFileThunk, deleteFileThunk, fetchFilesThunk } from "./fileThunks";
import type { LxFile } from "./types";

type FileState = {
    files: LxFile[];
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
    };
};

const initialState: FileState = {
    files: [],
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 },
};

const fileSlice = createSlice({
    name: "lxFile",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFilesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFilesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.files = action.payload.data;
                state.pagination = {
                    page: action.payload.pagination.page,
                    limit: action.payload.pagination.limit,
                    totalCount: action.payload.pagination.totalCount,
                    totalPages: action.payload.pagination.totalPages,
                };
            })
            .addCase(fetchFilesThunk.rejected, (state, action) => {
                if (action.meta.aborted) return; // superseded by a newer request
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load files";
            })
            .addCase(createFileThunk.fulfilled, (state, action) => {
                state.files = [action.payload.data, ...state.files];
                state.pagination.totalCount += 1;
                toast.success(action.payload.message);
            })
            .addCase(createFileThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Add file record failed");
            })
            .addCase(deleteFileThunk.fulfilled, (state, action) => {
                state.files = state.files.filter((f) => f.id !== action.payload.data.id);
                state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1);
                toast.success(action.payload.message);
            })
            .addCase(deleteFileThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Delete failed");
            });
    },
});

export default fileSlice.reducer;
