import { createSlice } from "@reduxjs/toolkit";
import { fetchFeedThunk } from "./feedThunks";
import type { LxAchievement } from "@/features/lx/achievement/types";

type State = { items: LxAchievement[]; loading: boolean; error: string | null };
const initialState: State = { items: [], loading: false, error: null };

const slice = createSlice({
    name: "lxFeed",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFeedThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFeedThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchFeedThunk.rejected, (state, action) => {
                if (action.meta.aborted) return; // superseded by a newer request
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load feed";
            });
    },
});

export default slice.reducer;
