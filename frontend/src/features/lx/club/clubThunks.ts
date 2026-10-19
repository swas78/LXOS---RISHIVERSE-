import { createAsyncThunk } from "@reduxjs/toolkit";
import { extractApiErrorMessage } from "@/utility/errorHelper";
import { clubApi } from "./clubApi";
import type { CreateLxClubPayload, LxClubListParams, UpdateLxClubPayload } from "./types";

export const fetchClubsThunk = createAsyncThunk(
    "lxClub/fetchAll",
    async (params: LxClubListParams | undefined, { rejectWithValue, signal }) => {
        try {
            return await clubApi.getAll(params, signal);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load clubs"));
        }
    },
);

export const fetchClubByIdThunk = createAsyncThunk(
    "lxClub/fetchById",
    async (id: string, { rejectWithValue }) => {
        try {
            return await clubApi.getById(id);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load club"));
        }
    },
);

export const createClubThunk = createAsyncThunk(
    "lxClub/create",
    async (payload: CreateLxClubPayload, { rejectWithValue }) => {
        try {
            return await clubApi.create(payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to create club"));
        }
    },
);

export const updateClubThunk = createAsyncThunk(
    "lxClub/update",
    async ({ id, payload }: { id: string; payload: UpdateLxClubPayload }, { rejectWithValue }) => {
        try {
            return await clubApi.update(id, payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to update club"));
        }
    },
);

export const deleteClubThunk = createAsyncThunk(
    "lxClub/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            return await clubApi.remove(id);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to delete club"));
        }
    },
);
