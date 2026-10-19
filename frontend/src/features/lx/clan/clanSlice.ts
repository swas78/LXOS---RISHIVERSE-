import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import {
    createClanThunk,
    deleteClanThunk,
    fetchClanByIdThunk,
    fetchClansThunk,
    manageClanPointsThunk,
    updateClanThunk,
} from "./clanThunks";
import type { LxClan } from "./types";

type ClanState = {
    clans: LxClan[];
    current: LxClan | null;
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

const initialState: ClanState = {
    clans: [],
    current: null,
    loading: false,
    detailLoading: false,
    error: null,
    pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 },
};

const upsertClan = (state: ClanState, clan: LxClan) => {
    const idx = state.clans.findIndex((c) => c.id === clan.id);
    if (idx >= 0) {
        // Preserve any already-loaded pointHistory if the incoming payload omits it.
        state.clans[idx] = { ...state.clans[idx], ...clan };
    }
    if (state.current && state.current.id === clan.id) {
        state.current = { ...state.current, ...clan };
    }
};

const clanSlice = createSlice({
    name: "lxClan",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchClansThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClansThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.clans = action.payload.data;
                state.pagination = {
                    page: action.payload.pagination.page,
                    limit: action.payload.pagination.limit,
                    totalCount: action.payload.pagination.totalCount,
                    totalPages: action.payload.pagination.totalPages,
                };
            })
            .addCase(fetchClansThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load clans";
            })
            .addCase(fetchClanByIdThunk.pending, (state) => {
                state.detailLoading = true;
                state.error = null;
            })
            .addCase(fetchClanByIdThunk.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.current = action.payload.data;
            })
            .addCase(fetchClanByIdThunk.rejected, (state, action) => {
                state.detailLoading = false;
                state.error = (action.payload as string) || "Failed to load clan";
            })
            .addCase(createClanThunk.fulfilled, (state, action) => {
                state.clans = [action.payload.data, ...state.clans];
                state.pagination.totalCount += 1;
                toast.success(action.payload.message);
            })
            .addCase(createClanThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Create failed");
            })
            .addCase(updateClanThunk.fulfilled, (state, action) => {
                upsertClan(state, action.payload.data);
                toast.success(action.payload.message);
            })
            .addCase(updateClanThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Update failed");
            })
            .addCase(deleteClanThunk.fulfilled, (state, action) => {
                state.clans = state.clans.filter((c) => c.id !== action.payload.data.id);
                state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1);
                toast.success(action.payload.message);
            })
            .addCase(deleteClanThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Delete failed");
            })
            .addCase(manageClanPointsThunk.fulfilled, (state, action) => {
                // managePoints returns the full clan (with fresh pointHistory).
                state.current = action.payload.data;
                const idx = state.clans.findIndex((c) => c.id === action.payload.data.id);
                if (idx >= 0) state.clans[idx] = action.payload.data;
                toast.success(action.payload.message);
            })
            .addCase(manageClanPointsThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Failed to update points");
            });
    },
});

export default clanSlice.reducer;
