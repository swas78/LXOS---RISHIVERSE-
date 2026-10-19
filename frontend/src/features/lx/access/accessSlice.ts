import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { assignAccessThunk, fetchAccessThunk, removeAccessThunk } from "./accessThunks";
import type { AccessOverview } from "./types";

type State = { overview: AccessOverview | null; loading: boolean; error: string | null };
const initialState: State = { overview: null, loading: false, error: null };

const slice = createSlice({
    name: "lxAccess",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAccessThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAccessThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.overview = action.payload;
            })
            .addCase(fetchAccessThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load access";
            })
            .addCase(assignAccessThunk.fulfilled, (_state, action) => {
                toast.success(action.payload.message || "Access updated");
            })
            .addCase(assignAccessThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Assign failed");
            })
            .addCase(removeAccessThunk.fulfilled, (_state, action) => {
                toast.success(action.payload.message || "Access removed");
            })
            .addCase(removeAccessThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Remove failed");
            });
    },
});

export default slice.reducer;
