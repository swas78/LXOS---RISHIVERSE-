import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import {
    approveEventThunk,
    completeEventThunk,
    createEventThunk,
    deleteEventThunk,
    fetchEventByIdThunk,
    fetchEventsThunk,
    updateEventThunk,
} from "./eventThunks";
import type { LxEvent } from "./types";

type EventState = {
    events: LxEvent[];
    selected: LxEvent | null;
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

const initialState: EventState = {
    events: [],
    selected: null,
    loading: false,
    detailLoading: false,
    error: null,
    pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 },
};

// Keep the list and the currently-open detail in sync after a mutation.
const applyUpdated = (state: EventState, updated: LxEvent) => {
    state.events = state.events.map((e) => (e.id === updated.id ? updated : e));
    if (state.selected?.id === updated.id) {
        state.selected = updated;
    }
};

const eventSlice = createSlice({
    name: "lxEvent",
    initialState,
    reducers: {
        clearSelectedEvent: (state) => {
            state.selected = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEventsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEventsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.events = action.payload.data;
                state.pagination = {
                    page: action.payload.pagination.page,
                    limit: action.payload.pagination.limit,
                    totalCount: action.payload.pagination.totalCount,
                    totalPages: action.payload.pagination.totalPages,
                };
            })
            .addCase(fetchEventsThunk.rejected, (state, action) => {
                if (action.meta.aborted) return; // superseded by a newer request
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load events";
            })
            .addCase(fetchEventByIdThunk.pending, (state) => {
                state.detailLoading = true;
                state.error = null;
            })
            .addCase(fetchEventByIdThunk.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.selected = action.payload.data;
            })
            .addCase(fetchEventByIdThunk.rejected, (state, action) => {
                state.detailLoading = false;
                state.error = (action.payload as string) || "Failed to load event";
            })
            .addCase(createEventThunk.fulfilled, (state, action) => {
                state.events = [action.payload.data, ...state.events];
                state.pagination.totalCount += 1;
                toast.success(action.payload.message);
            })
            .addCase(createEventThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Create failed");
            })
            .addCase(updateEventThunk.fulfilled, (state, action) => {
                applyUpdated(state, action.payload.data);
                toast.success(action.payload.message);
            })
            .addCase(updateEventThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Update failed");
            })
            .addCase(deleteEventThunk.fulfilled, (state, action) => {
                state.events = state.events.filter((e) => e.id !== action.payload.data.id);
                state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1);
                if (state.selected?.id === action.payload.data.id) {
                    state.selected = null;
                }
                toast.success(action.payload.message);
            })
            .addCase(deleteEventThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Delete failed");
            })
            .addCase(approveEventThunk.fulfilled, (state, action) => {
                applyUpdated(state, action.payload.data);
                toast.success(action.payload.message);
            })
            .addCase(approveEventThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Review failed");
            })
            .addCase(completeEventThunk.fulfilled, (state, action) => {
                applyUpdated(state, action.payload.data);
                toast.success(action.payload.message);
            })
            .addCase(completeEventThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Complete failed");
            });
    },
});

export const { clearSelectedEvent } = eventSlice.actions;
export default eventSlice.reducer;
