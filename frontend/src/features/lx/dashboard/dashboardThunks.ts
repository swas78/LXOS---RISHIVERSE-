import { createAsyncThunk } from "@reduxjs/toolkit";
import { extractApiErrorMessage } from "@/utility/errorHelper";
import { dashboardApi } from "./dashboardApi";

export const fetchDashboardThunk = createAsyncThunk(
    "lxDashboard/fetch",
    async (_: void, { signal, rejectWithValue }) => {
        try {
            return await dashboardApi.getStats(signal);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load dashboard"));
        }
    },
);
