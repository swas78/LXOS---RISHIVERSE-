import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import {
    createClubThunk,
    deleteClubThunk,
    fetchClubByIdThunk,
    fetchClubsThunk,
    updateClubThunk,
} from "./clubThunks";
import type { LxClub } from "./types";

type ClubState = {
    clubs: LxClub[];
    current: LxClub | null;
    loading: boolean;
    detailLoading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
    };
};

const initialState: ClubState = {
    clubs: [],
    current: null,
    loading: false,
    detailLoading: false,
    error: null,
    pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 },
};

const clubSlice = createSlice({
    name: "lxClub",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchClubsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClubsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.clubs = action.payload.data;
                state.pagination = {
                    page: action.payload.pagination.page,
                    limit: action.payload.pagination.limit,
                    totalCount: action.payload.pagination.totalCount,
                    totalPages: action.payload.pagination.totalPages,
                };
            })
            .addCase(fetchClubsThunk.rejected, (state, action) => {
                if (action.meta.aborted) return; // superseded by a newer request
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load clubs";
            })
            .addCase(fetchClubByIdThunk.pending, (state) => {
                state.detailLoading = true;
                state.error = null;
                state.current = null;
            })
            .addCase(fetchClubByIdThunk.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.current = action.payload.data;
            })
            .addCase(fetchClubByIdThunk.rejected, (state, action) => {
                state.detailLoading = false;
                state.error = (action.payload as string) || "Failed to load club";
            })
            .addCase(createClubThunk.fulfilled, (state, action) => {
                state.clubs = [action.payload.data, ...state.clubs];
                state.pagination.totalCount += 1;
                toast.success(action.payload.message);
            })
            .addCase(createClubThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Create failed");
            })
            .addCase(updateClubThunk.fulfilled, (state, action) => {
                const updated = action.payload.data;
                state.clubs = state.clubs.map((c) => (c.id === updated.id ? updated : c));
                if (state.current?.id === updated.id) state.current = updated;
                toast.success(action.payload.message);
            })
            .addCase(updateClubThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Update failed");
            })
            .addCase(deleteClubThunk.fulfilled, (state, action) => {
                state.clubs = state.clubs.filter((c) => c.id !== action.payload.data.id);
                state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1);
                toast.success(action.payload.message);
            })
            .addCase(deleteClubThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Delete failed");
            });
    },
});

export default clubSlice.reducer;
