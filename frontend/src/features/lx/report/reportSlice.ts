import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import {
    downloadReportCsvThunk,
    fetchReportThunk,
    fetchSemestersThunk,
    rolloverThunk,
} from "./reportThunks";
import type { LxReport } from "./types";

type State = {
    report: LxReport | null;
    semesters: string[];
    current: string | null;
    loading: boolean;
    downloading: boolean;
    error: string | null;
};
const initialState: State = {
    report: null,
    semesters: [],
    current: null,
    loading: false,
    downloading: false,
    error: null,
};

const slice = createSlice({
    name: "lxReport",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSemestersThunk.fulfilled, (state, action) => {
                state.semesters = action.payload.semesters;
                state.current = action.payload.current;
            })
            .addCase(fetchReportThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReportThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.report = action.payload;
            })
            .addCase(fetchReportThunk.rejected, (state, action) => {
                if (action.meta.aborted) return;
                state.loading = false;
                state.error = (action.payload as string) || "Failed to generate report";
            })
            .addCase(rolloverThunk.fulfilled, (_state, action) => {
                toast.success(action.payload.message || "Semester rolled over");
            })
            .addCase(rolloverThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Rollover failed");
            })
            // The CSV download owns its own busy flag so the page does not need
            // local state for it — the button reads `downloading` from the store.
            .addCase(downloadReportCsvThunk.pending, (state) => {
                state.downloading = true;
            })
            .addCase(downloadReportCsvThunk.fulfilled, (state, action) => {
                state.downloading = false;
                toast.success(action.payload.message);
            })
            .addCase(downloadReportCsvThunk.rejected, (state, action) => {
                state.downloading = false;
                toast.error((action.payload as string) || "Failed to download report");
            });
    },
});

export default slice.reducer;
