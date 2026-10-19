import { createAsyncThunk } from "@reduxjs/toolkit";
import { extractApiErrorMessage } from "@/utility/errorHelper";
import { clanApi } from "./clanApi";
import type {
    CreateLxClanPayload,
    LxClanListParams,
    ManageClanPointsPayload,
    UpdateLxClanPayload,
} from "./types";

export const fetchClansThunk = createAsyncThunk(
    "lxClan/fetchAll",
    async (params: LxClanListParams | undefined, { rejectWithValue }) => {
        try {
            return await clanApi.getAll(params);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load clans"));
        }
    },
);

export const fetchClanByIdThunk = createAsyncThunk(
    "lxClan/fetchById",
    async (id: string, { rejectWithValue }) => {
        try {
            return await clanApi.getById(id);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load clan"));
        }
    },
);

export const createClanThunk = createAsyncThunk(
    "lxClan/create",
    async (payload: CreateLxClanPayload, { rejectWithValue }) => {
        try {
            return await clanApi.create(payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to create clan"));
        }
    },
);

export const updateClanThunk = createAsyncThunk(
    "lxClan/update",
    async ({ id, payload }: { id: string; payload: UpdateLxClanPayload }, { rejectWithValue }) => {
        try {
            return await clanApi.update(id, payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to update clan"));
        }
    },
);

export const deleteClanThunk = createAsyncThunk(
    "lxClan/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            return await clanApi.remove(id);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to delete clan"));
        }
    },
);

export const manageClanPointsThunk = createAsyncThunk(
    "lxClan/managePoints",
    async (
        { id, payload }: { id: string; payload: ManageClanPointsPayload },
        { rejectWithValue },
    ) => {
        try {
            return await clanApi.managePoints(id, payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to update points"));
        }
    },
);
