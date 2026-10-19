import { createAsyncThunk } from "@reduxjs/toolkit";
import { extractApiErrorMessage } from "@/utility/errorHelper";
import { reimbursementApi } from "./reimbursementApi";
import type {
    CreateLxReimbursementPayload,
    LxReimbursementListParams,
    ReviewReimbursementPayload,
} from "./types";

export const fetchReimbursementsThunk = createAsyncThunk(
    "lxReimbursement/fetchAll",
    async (params: LxReimbursementListParams | undefined, { rejectWithValue }) => {
        try {
            return await reimbursementApi.getAll(params);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load reimbursements"));
        }
    },
);

export const fetchReimbursementByIdThunk = createAsyncThunk(
    "lxReimbursement/fetchById",
    async (id: string, { rejectWithValue }) => {
        try {
            return await reimbursementApi.getById(id);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load reimbursement"));
        }
    },
);

export const createReimbursementThunk = createAsyncThunk(
    "lxReimbursement/create",
    async (payload: CreateLxReimbursementPayload, { rejectWithValue }) => {
        try {
            return await reimbursementApi.create(payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to submit reimbursement"));
        }
    },
);

export const reviewReimbursementThunk = createAsyncThunk(
    "lxReimbursement/review",
    async (
        { id, payload }: { id: string; payload: ReviewReimbursementPayload },
        { rejectWithValue },
    ) => {
        try {
            return await reimbursementApi.review(id, payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to review reimbursement"));
        }
    },
);

export const processReimbursementThunk = createAsyncThunk(
    "lxReimbursement/process",
    async ({ id, payoutTxnRef }: { id: string; payoutTxnRef?: string }, { rejectWithValue }) => {
        try {
            return await reimbursementApi.process(id, payoutTxnRef);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to process reimbursement"));
        }
    },
);
