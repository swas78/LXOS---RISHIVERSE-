import { createAsyncThunk } from "@reduxjs/toolkit";
import { extractApiErrorMessage } from "@/utility/errorHelper";
import { fileApi } from "./fileApi";
import type { CreateLxFilePayload, LxFileListParams } from "./types";

export const fetchFilesThunk = createAsyncThunk(
    "lxFile/fetchAll",
    async (params: LxFileListParams | undefined, { rejectWithValue, signal }) => {
        try {
            return await fileApi.getAll(params, signal);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load files"));
        }
    },
);

export const createFileThunk = createAsyncThunk(
    "lxFile/create",
    async (payload: CreateLxFilePayload, { rejectWithValue }) => {
        try {
            return await fileApi.create(payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to add file record"));
        }
    },
);

export const deleteFileThunk = createAsyncThunk(
    "lxFile/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            return await fileApi.remove(id);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to delete file"));
        }
    },
);
