import { createAsyncThunk } from "@reduxjs/toolkit";
import { extractApiErrorMessage } from "@/utility/errorHelper";
import { reportApi } from "./reportApi";
import type { RolloverPayload } from "./types";

export const fetchSemestersThunk = createAsyncThunk(
    "lxReport/fetchSemesters",
    async (_: void, { signal, rejectWithValue }) => {
        try {
            return await reportApi.getSemesters(signal);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load semesters"));
        }
    },
);

export const fetchReportThunk = createAsyncThunk(
    "lxReport/fetch",
    async (semester: string | undefined, { signal, rejectWithValue }) => {
        try {
            return await reportApi.get(semester, signal);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to generate report"));
        }
    },
);

export const rolloverThunk = createAsyncThunk(
    "lxReport/rollover",
    async (payload: RolloverPayload, { rejectWithValue }) => {
        try {
            return await reportApi.rollover(payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Rollover failed"));
        }
    },
);

/** Fetches the CSV and hands the browser a download. */
export const downloadReportCsvThunk = createAsyncThunk(
    "lxReport/downloadCsv",
    async (
        { semester, filenameHint }: { semester?: string; filenameHint?: string },
        { rejectWithValue },
    ) => {
        try {
            const blob = await reportApi.downloadCsv(semester);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `lx-report-${(filenameHint || "current").replace(/\s+/g, "-").toLowerCase()}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            return { message: "Report downloaded" };
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to download report"));
        }
    },
);
