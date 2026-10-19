import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import {
    createInitiativeThunk,
    deleteInitiativeThunk,
    fetchInitiativeByIdThunk,
    fetchInitiativesThunk,
    updateInitiativeThunk,
} from "./initiativeThunks";
import type { LxInitiative } from "./types";

type InitiativeState = {
    initiatives: LxInitiative[];
    current: LxInitiative | null;
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
    };
};

const initialState: InitiativeState = {
    initiatives: [],
    current: null,
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 },
};

const initiativeSlice = createSlice({
    name: "lxInitiative",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchInitiativesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInitiativesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.initiatives = action.payload.data;
                state.pagination = {
                    page: action.payload.pagination.page,
                    limit: action.payload.pagination.limit,
                    totalCount: action.payload.pagination.totalCount,
                    totalPages: action.payload.pagination.totalPages,
                };
            })
            .addCase(fetchInitiativesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load initiatives";
            })
            .addCase(fetchInitiativeByIdThunk.fulfilled, (state, action) => {
                state.current = action.payload.data;
            })
            .addCase(createInitiativeThunk.fulfilled, (state, action) => {
                state.initiatives = [action.payload.data, ...state.initiatives];
                state.pagination.totalCount += 1;
                toast.success(action.payload.message);
            })
            .addCase(createInitiativeThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Create failed");
            })
            .addCase(updateInitiativeThunk.fulfilled, (state, action) => {
                const idx = state.initiatives.findIndex((i) => i.id === action.payload.data.id);
                if (idx >= 0) state.initiatives[idx] = action.payload.data;
                if (state.current && state.current.id === action.payload.data.id) {
                    state.current = action.payload.data;
                }
                toast.success(action.payload.message);
            })
            .addCase(updateInitiativeThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Update failed");
            })
            .addCase(deleteInitiativeThunk.fulfilled, (state, action) => {
                state.initiatives = state.initiatives.filter(
                    (i) => i.id !== action.payload.data.id,
                );
                state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1);
                toast.success(action.payload.message);
            })
            .addCase(deleteInitiativeThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Delete failed");
            });
    },
});

export default initiativeSlice.reducer;
