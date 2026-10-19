import { createAsyncThunk } from "@reduxjs/toolkit";
import { extractApiErrorMessage } from "@/utility/errorHelper";
import { accessApi } from "./accessApi";
import type { AssignPayload, RemovePayload } from "./types";

export const fetchAccessThunk = createAsyncThunk(
    "lxAccess/fetch",
    async (_: void, { signal, rejectWithValue }) => {
        try {
            return await accessApi.getAll(signal);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load access"));
        }
    },
);

export const assignAccessThunk = createAsyncThunk(
    "lxAccess/assign",
    async (payload: AssignPayload, { rejectWithValue }) => {
        try {
            return await accessApi.assign(payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to assign access"));
        }
    },
);

export const removeAccessThunk = createAsyncThunk(
    "lxAccess/remove",
    async (payload: RemovePayload, { rejectWithValue }) => {
        try {
            return await accessApi.remove(payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to remove access"));
        }
    },
);
