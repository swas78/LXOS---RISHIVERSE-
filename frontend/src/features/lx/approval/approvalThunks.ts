import { createAsyncThunk } from "@reduxjs/toolkit";
import { extractApiErrorMessage } from "@/utility/errorHelper";
import { approvalApi } from "./approvalApi";
import type { ActPayload } from "./types";

export const fetchApprovalsThunk = createAsyncThunk(
    "lxApproval/fetch",
    async (params: { type?: string } | undefined, { signal, rejectWithValue }) => {
        try {
            return await approvalApi.getAll(params, signal);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load approvals"));
        }
    },
);

export const actOnApprovalThunk = createAsyncThunk(
    "lxApproval/act",
    async (payload: ActPayload, { rejectWithValue }) => {
        try {
            const data = await approvalApi.act(payload);
            return { ...data, payload };
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Action failed"));
        }
    },
);
