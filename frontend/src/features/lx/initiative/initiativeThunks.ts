import { createAsyncThunk } from "@reduxjs/toolkit";
import { extractApiErrorMessage } from "@/utility/errorHelper";
import { initiativeApi } from "./initiativeApi";
import type {
    CreateLxInitiativePayload,
    LxInitiativeListParams,
    UpdateLxInitiativePayload,
} from "./types";

export const fetchInitiativesThunk = createAsyncThunk(
    "lxInitiative/fetchAll",
    async (params: LxInitiativeListParams | undefined, { rejectWithValue }) => {
        try {
            return await initiativeApi.getAll(params);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load initiatives"));
        }
    },
);

export const fetchInitiativeByIdThunk = createAsyncThunk(
    "lxInitiative/fetchById",
    async (id: string, { rejectWithValue }) => {
        try {
            return await initiativeApi.getById(id);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load initiative"));
        }
    },
);

export const createInitiativeThunk = createAsyncThunk(
    "lxInitiative/create",
    async (payload: CreateLxInitiativePayload, { rejectWithValue }) => {
        try {
            return await initiativeApi.create(payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to create initiative"));
        }
    },
);

export const updateInitiativeThunk = createAsyncThunk(
    "lxInitiative/update",
    async (
        { id, payload }: { id: string; payload: UpdateLxInitiativePayload },
        { rejectWithValue },
    ) => {
        try {
            return await initiativeApi.update(id, payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to update initiative"));
        }
    },
);

export const deleteInitiativeThunk = createAsyncThunk(
    "lxInitiative/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            return await initiativeApi.remove(id);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to delete initiative"));
        }
    },
);
