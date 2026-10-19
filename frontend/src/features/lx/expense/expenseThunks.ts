import { createAsyncThunk } from "@reduxjs/toolkit";
import { extractApiErrorMessage } from "@/utility/errorHelper";
import { expenseApi } from "./expenseApi";
import type { CreateLxExpensePayload, LxExpenseListParams, VerifyExpensePayload } from "./types";

export const fetchExpensesThunk = createAsyncThunk(
    "lxExpense/fetchAll",
    async (params: LxExpenseListParams | undefined, { rejectWithValue }) => {
        try {
            return await expenseApi.getAll(params);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load expenses"));
        }
    },
);

export const createExpenseThunk = createAsyncThunk(
    "lxExpense/create",
    async (payload: CreateLxExpensePayload, { rejectWithValue }) => {
        try {
            return await expenseApi.create(payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to create expense"));
        }
    },
);

export const verifyExpenseThunk = createAsyncThunk(
    "lxExpense/verify",
    async ({ id, payload }: { id: string; payload: VerifyExpensePayload }, { rejectWithValue }) => {
        try {
            return await expenseApi.verify(id, payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to verify expense"));
        }
    },
);

export const deleteExpenseThunk = createAsyncThunk(
    "lxExpense/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            return await expenseApi.remove(id);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to delete expense"));
        }
    },
);
