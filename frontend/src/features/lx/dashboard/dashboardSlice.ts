import { createSlice } from "@reduxjs/toolkit";
import { fetchDashboardThunk } from "./dashboardThunks";
import type { DashboardStats } from "./types";

type State = { data: DashboardStats | null; loading: boolean; error: string | null };
const initialState: State = { data: null, loading: false, error: null };

const slice = createSlice({
    name: "lxDashboard",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchDashboardThunk.rejected, (state, action) => {
                if (action.meta.aborted) return;
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load dashboard";
            });
    },
});

export default slice.reducer;
