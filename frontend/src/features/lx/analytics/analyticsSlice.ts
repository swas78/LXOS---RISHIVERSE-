import { createSlice } from "@reduxjs/toolkit";
import { fetchAnalyticsThunk } from "./analyticsThunks";
import type { AnalyticsData } from "./types";

type State = { data: AnalyticsData | null; loading: boolean; error: string | null };
const initialState: State = { data: null, loading: false, error: null };

const slice = createSlice({
    name: "lxAnalytics",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAnalyticsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAnalyticsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchAnalyticsThunk.rejected, (state, action) => {
                if (action.meta.aborted) return;
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load analytics";
            });
    },
});

export default slice.reducer;
