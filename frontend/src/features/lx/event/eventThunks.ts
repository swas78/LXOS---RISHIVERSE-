import { createAsyncThunk } from "@reduxjs/toolkit";
import { extractApiErrorMessage } from "@/utility/errorHelper";
import { eventApi } from "./eventApi";
import type {
    ApproveEventPayload,
    AvailabilityPayload,
    CreateLxEventPayload,
    LxEventListParams,
    UpdateLxEventPayload,
} from "./types";

export const fetchEventsThunk = createAsyncThunk(
    "lxEvent/fetchAll",
    async (params: LxEventListParams | undefined, { rejectWithValue, signal }) => {
        try {
            return await eventApi.getAll(params, signal);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load events"));
        }
    },
);

export const fetchEventByIdThunk = createAsyncThunk(
    "lxEvent/fetchById",
    async (id: string, { rejectWithValue }) => {
        try {
            return await eventApi.getById(id);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load event"));
        }
    },
);

export const createEventThunk = createAsyncThunk(
    "lxEvent/create",
    async (payload: CreateLxEventPayload, { rejectWithValue }) => {
        try {
            return await eventApi.create(payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to create event"));
        }
    },
);

export const updateEventThunk = createAsyncThunk(
    "lxEvent/update",
    async ({ id, payload }: { id: string; payload: UpdateLxEventPayload }, { rejectWithValue }) => {
        try {
            return await eventApi.update(id, payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to update event"));
        }
    },
);

export const deleteEventThunk = createAsyncThunk(
    "lxEvent/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            return await eventApi.remove(id);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to delete event"));
        }
    },
);

export const approveEventThunk = createAsyncThunk(
    "lxEvent/approve",
    async ({ id, payload }: { id: string; payload: ApproveEventPayload }, { rejectWithValue }) => {
        try {
            return await eventApi.approve(id, payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to review event"));
        }
    },
);

export const completeEventThunk = createAsyncThunk(
    "lxEvent/complete",
    async (id: string, { rejectWithValue }) => {
        try {
            return await eventApi.complete(id);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to complete event"));
        }
    },
);

export const checkAvailabilityThunk = createAsyncThunk(
    "lxEvent/checkAvailability",
    async (payload: AvailabilityPayload, { rejectWithValue }) => {
        try {
            return await eventApi.checkAvailability(payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to check availability"));
        }
    },
);
