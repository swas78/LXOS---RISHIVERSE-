import { createAsyncThunk } from "@reduxjs/toolkit";
import { extractApiErrorMessage } from "@/utility/errorHelper";
import { roomApi } from "./roomApi";
import type { CreateLxRoomPayload, LxRoomListParams, UpdateLxRoomPayload } from "./types";

export const fetchRoomsThunk = createAsyncThunk(
    "lxRoom/fetchAll",
    async (params: LxRoomListParams | undefined, { rejectWithValue, signal }) => {
        try {
            return await roomApi.getAll(params, signal);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load rooms"));
        }
    },
);

export const createRoomThunk = createAsyncThunk(
    "lxRoom/create",
    async (payload: CreateLxRoomPayload, { rejectWithValue }) => {
        try {
            return await roomApi.create(payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to create room"));
        }
    },
);

export const updateRoomThunk = createAsyncThunk(
    "lxRoom/update",
    async ({ id, payload }: { id: string; payload: UpdateLxRoomPayload }, { rejectWithValue }) => {
        try {
            return await roomApi.update(id, payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to update room"));
        }
    },
);

export const deleteRoomThunk = createAsyncThunk(
    "lxRoom/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            return await roomApi.remove(id);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to delete room"));
        }
    },
);
