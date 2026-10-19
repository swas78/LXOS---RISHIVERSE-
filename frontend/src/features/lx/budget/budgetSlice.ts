import { createSlice } from "@reduxjs/toolkit";
import { fetchBudgetThunk } from "./budgetThunks";
import type { BudgetSummary } from "./types";

type State = { data: BudgetSummary | null; loading: boolean; error: string | null };
const initialState: State = { data: null, loading: false, error: null };

const slice = createSlice({
    name: "lxBudget",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBudgetThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBudgetThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchBudgetThunk.rejected, (state, action) => {
                if (action.meta.aborted) return;
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load budget";
            });
    },
});

export default slice.reducer;
