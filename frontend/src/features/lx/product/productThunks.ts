import { createAsyncThunk } from "@reduxjs/toolkit";
import { extractApiErrorMessage } from "@/utility/errorHelper";
import { productApi } from "./productApi";
import type { CreateLxProductPayload, LxProductListParams, ReviewProductPayload } from "./types";

export const fetchProductsThunk = createAsyncThunk(
    "lxProduct/fetchAll",
    async (params: LxProductListParams | undefined, { rejectWithValue, signal }) => {
        try {
            return await productApi.getAll(params, signal);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load products"));
        }
    },
);

export const createProductThunk = createAsyncThunk(
    "lxProduct/create",
    async (payload: CreateLxProductPayload, { rejectWithValue }) => {
        try {
            return await productApi.create(payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to submit product"));
        }
    },
);

export const reviewProductThunk = createAsyncThunk(
    "lxProduct/review",
    async ({ id, payload }: { id: string; payload: ReviewProductPayload }, { rejectWithValue }) => {
        try {
            return await productApi.review(id, payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to review product"));
        }
    },
);

export const deleteProductThunk = createAsyncThunk(
    "lxProduct/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            return await productApi.remove(id);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to delete product"));
        }
    },
);
