import { createAsyncThunk } from "@reduxjs/toolkit";
import { extractApiErrorMessage } from "@/utility/errorHelper";
import { itemApi } from "./itemApi";
import type { CreateDemoItemPayload } from "./types";

export const fetchItemsThunk = createAsyncThunk(
    "demoItem/fetchAll",
    async (
        params: { search?: string; page?: number; limit?: number } | undefined,
        { rejectWithValue },
    ) => {
        try {
            return await itemApi.getAll(params);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load items"));
        }
    },
);

export const createItemThunk = createAsyncThunk(
    "demoItem/create",
    async (payload: CreateDemoItemPayload, { rejectWithValue }) => {
        try {
            return await itemApi.create(payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to create item"));
        }
    },
);

export const deleteItemThunk = createAsyncThunk(
    "demoItem/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            return await itemApi.remove(id);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to delete item"));
        }
    },
);
