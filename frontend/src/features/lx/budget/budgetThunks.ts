import { createAsyncThunk } from "@reduxjs/toolkit";
import { extractApiErrorMessage } from "@/utility/errorHelper";
import { budgetApi } from "./budgetApi";

export const fetchBudgetThunk = createAsyncThunk(
    "lxBudget/fetch",
    async (_: void, { signal, rejectWithValue }) => {
        try {
            return await budgetApi.getSummary(signal);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load budget"));
        }
    },
);
