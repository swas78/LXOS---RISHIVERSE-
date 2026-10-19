import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { createRoomThunk, deleteRoomThunk, fetchRoomsThunk, updateRoomThunk } from "./roomThunks";
import type { LxRoom } from "./types";

type RoomState = {
    rooms: LxRoom[];
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
    };
};

const initialState: RoomState = {
    rooms: [],
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 },
};

const roomSlice = createSlice({
    name: "lxRoom",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRoomsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoomsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.rooms = action.payload.data;
                state.pagination = {
                    page: action.payload.pagination.page,
                    limit: action.payload.pagination.limit,
                    totalCount: action.payload.pagination.totalCount,
                    totalPages: action.payload.pagination.totalPages,
                };
            })
            .addCase(fetchRoomsThunk.rejected, (state, action) => {
                if (action.meta.aborted) return; // superseded by a newer request
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load rooms";
            })
            .addCase(createRoomThunk.fulfilled, (state, action) => {
                state.rooms = [action.payload.data, ...state.rooms];
                state.pagination.totalCount += 1;
                toast.success(action.payload.message);
            })
            .addCase(createRoomThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Create failed");
            })
            .addCase(updateRoomThunk.fulfilled, (state, action) => {
                state.rooms = state.rooms.map((r) =>
                    r.id === action.payload.data.id ? action.payload.data : r,
                );
                toast.success(action.payload.message);
            })
            .addCase(updateRoomThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Update failed");
            })
            .addCase(deleteRoomThunk.fulfilled, (state, action) => {
                state.rooms = state.rooms.filter((r) => r.id !== action.payload.data.id);
                state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1);
                toast.success(action.payload.message);
            })
            .addCase(deleteRoomThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Delete failed");
            });
    },
});

export default roomSlice.reducer;
