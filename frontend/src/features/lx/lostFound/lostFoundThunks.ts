import { createAsyncThunk } from "@reduxjs/toolkit";
import { lostFoundApi } from "./lostFoundApi";
import type { CreateLxLostFoundPayload, LxLostFoundListParams } from "./types";

const messageOf = (error: unknown, fallback: string) =>
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;

export const fetchLostFoundThunk = createAsyncThunk(
    "lxLostFound/fetchAll",
    async (params: LxLostFoundListParams | undefined, { signal, rejectWithValue }) => {
        try {
            return await lostFoundApi.getAll(params, signal);
        } catch (error) {
            return rejectWithValue(messageOf(error, "Could not load the noticeboard."));
        }
    },
);

export const createLostFoundThunk = createAsyncThunk(
    "lxLostFound/create",
    async (payload: CreateLxLostFoundPayload, { rejectWithValue }) => {
        try {
            return await lostFoundApi.create(payload);
        } catch (error) {
            return rejectWithValue(messageOf(error, "Could not submit the report."));
        }
    },
);

export const reviewLostFoundThunk = createAsyncThunk(
    "lxLostFound/review",
    async (
        {
            id,
            action,
            rejectionReason,
        }: { id: string; action: "approve" | "reject"; rejectionReason?: string },
        { rejectWithValue },
    ) => {
        try {
            return await lostFoundApi.review(id, { action, rejectionReason });
        } catch (error) {
            return rejectWithValue(messageOf(error, "Could not record that decision."));
        }
    },
);

export const resolveLostFoundThunk = createAsyncThunk(
    "lxLostFound/resolve",
    async (
        { id, resolutionNote }: { id: string; resolutionNote?: string },
        { rejectWithValue },
    ) => {
        try {
            return await lostFoundApi.resolve(id, resolutionNote);
        } catch (error) {
            return rejectWithValue(messageOf(error, "Could not mark it returned."));
        }
    },
);

export const deleteLostFoundThunk = createAsyncThunk(
    "lxLostFound/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            return await lostFoundApi.remove(id);
        } catch (error) {
            return rejectWithValue(messageOf(error, "Could not remove the report."));
        }
    },
);
