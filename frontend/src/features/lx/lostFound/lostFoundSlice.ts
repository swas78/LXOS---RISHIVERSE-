import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import {
    createLostFoundThunk,
    deleteLostFoundThunk,
    fetchLostFoundThunk,
    resolveLostFoundThunk,
    reviewLostFoundThunk,
} from "./lostFoundThunks";
import type { LxLostFoundCounts, LxLostFoundItem } from "./types";

type State = {
    items: LxLostFoundItem[];
    counts: LxLostFoundCounts;
    pagination: { page: number; limit: number; totalCount: number; totalPages: number };
    loading: boolean;
    acting: boolean;
    error: string | null;
};

const initialState: State = {
    items: [],
    counts: { APPROVED: 0, PENDING: 0, RESOLVED: 0, canReview: false },
    pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 },
    loading: false,
    acting: false,
    error: null,
};

const lostFoundSlice = createSlice({
    name: "lxLostFound",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLostFoundThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLostFoundThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.counts = action.payload.meta.counts;
                state.pagination = {
                    page: action.payload.pagination.page,
                    limit: action.payload.pagination.limit,
                    totalCount: action.payload.pagination.totalCount,
                    totalPages: action.payload.pagination.totalPages,
                };
            })
            .addCase(fetchLostFoundThunk.rejected, (state, action) => {
                if (action.meta.aborted) return; // superseded by a newer search
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(createLostFoundThunk.pending, (state) => {
                state.acting = true;
            })
            .addCase(createLostFoundThunk.fulfilled, (state, action) => {
                state.acting = false;
                // The new report is PENDING, so it does NOT join the public board here.
                // Saying so plainly is the point — the author should not go looking for
                // a post that is deliberately invisible.
                toast.success(action.payload.message);
            })
            .addCase(createLostFoundThunk.rejected, (state, action) => {
                state.acting = false;
                toast.error(action.payload as string);
            })

            .addCase(reviewLostFoundThunk.pending, (state) => {
                state.acting = true;
            })
            .addCase(reviewLostFoundThunk.fulfilled, (state, action) => {
                state.acting = false;
                // Drop it from the queue immediately; the caller refetches for counts.
                state.items = state.items.filter((i) => i.id !== action.payload.data.id);
                toast.success(action.payload.message);
            })
            .addCase(reviewLostFoundThunk.rejected, (state, action) => {
                state.acting = false;
                toast.error(action.payload as string);
            })

            .addCase(resolveLostFoundThunk.fulfilled, (state, action) => {
                state.items = state.items.filter((i) => i.id !== action.payload.data.id);
                toast.success(action.payload.message);
            })
            .addCase(resolveLostFoundThunk.rejected, (_state, action) => {
                toast.error(action.payload as string);
            })

            .addCase(deleteLostFoundThunk.fulfilled, (state, action) => {
                state.items = state.items.filter((i) => i.id !== action.payload.data.id);
                toast.success(action.payload.message);
            })
            .addCase(deleteLostFoundThunk.rejected, (_state, action) => {
                toast.error(action.payload as string);
            });
    },
});

export default lostFoundSlice.reducer;
