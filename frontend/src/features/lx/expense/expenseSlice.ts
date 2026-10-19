import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import {
    createExpenseThunk,
    deleteExpenseThunk,
    fetchExpensesThunk,
    verifyExpenseThunk,
} from "./expenseThunks";
import type { LxExpense } from "./types";

type ExpenseState = {
    expenses: LxExpense[];
    loading: boolean;
    error: string | null;
    pagination: { page: number; limit: number; totalCount: number; totalPages: number };
};

const initialState: ExpenseState = {
    expenses: [],
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 },
};

const slice = createSlice({
    name: "lxExpense",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchExpensesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExpensesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses = action.payload.data;
                state.pagination = {
                    page: action.payload.pagination.page,
                    limit: action.payload.pagination.limit,
                    totalCount: action.payload.pagination.totalCount,
                    totalPages: action.payload.pagination.totalPages,
                };
            })
            .addCase(fetchExpensesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load expenses";
            })
            .addCase(createExpenseThunk.fulfilled, (state, action) => {
                state.expenses = [action.payload.data, ...state.expenses];
                state.pagination.totalCount += 1;
                toast.success(action.payload.message);
            })
            .addCase(createExpenseThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Create failed");
            })
            .addCase(verifyExpenseThunk.fulfilled, (state, action) => {
                state.expenses = state.expenses.map((e) =>
                    e.id === action.payload.data.id ? action.payload.data : e,
                );
                toast.success(action.payload.message);
            })
            .addCase(verifyExpenseThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Verify failed");
            })
            .addCase(deleteExpenseThunk.fulfilled, (state, action) => {
                state.expenses = state.expenses.filter((e) => e.id !== action.payload.data.id);
                state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1);
                toast.success(action.payload.message);
            })
            .addCase(deleteExpenseThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Delete failed");
            });
    },
});

export default slice.reducer;
