import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import {
    createReimbursementThunk,
    fetchReimbursementByIdThunk,
    fetchReimbursementsThunk,
    processReimbursementThunk,
    reviewReimbursementThunk,
} from "./reimbursementThunks";
import type { LxReimbursement } from "./types";

type ReimbursementState = {
    reimbursements: LxReimbursement[];
    selected: LxReimbursement | null;
    loading: boolean;
    detailLoading: boolean;
    error: string | null;
    pagination: { page: number; limit: number; totalCount: number; totalPages: number };
};

const initialState: ReimbursementState = {
    reimbursements: [],
    selected: null,
    loading: false,
    detailLoading: false,
    error: null,
    pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 },
};

const applyUpdated = (state: ReimbursementState, updated: LxReimbursement) => {
    state.reimbursements = state.reimbursements.map((r) => (r.id === updated.id ? updated : r));
    if (state.selected?.id === updated.id) state.selected = updated;
};

const slice = createSlice({
    name: "lxReimbursement",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchReimbursementsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReimbursementsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.reimbursements = action.payload.data;
                state.pagination = {
                    page: action.payload.pagination.page,
                    limit: action.payload.pagination.limit,
                    totalCount: action.payload.pagination.totalCount,
                    totalPages: action.payload.pagination.totalPages,
                };
            })
            .addCase(fetchReimbursementsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load reimbursements";
            })
            .addCase(fetchReimbursementByIdThunk.pending, (state) => {
                state.detailLoading = true;
            })
            .addCase(fetchReimbursementByIdThunk.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.selected = action.payload.data;
            })
            .addCase(fetchReimbursementByIdThunk.rejected, (state, action) => {
                state.detailLoading = false;
                state.error = (action.payload as string) || "Failed to load reimbursement";
            })
            .addCase(createReimbursementThunk.fulfilled, (state, action) => {
                state.reimbursements = [action.payload.data, ...state.reimbursements];
                state.pagination.totalCount += 1;
                toast.success(action.payload.message);
            })
            .addCase(createReimbursementThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Submit failed");
            })
            .addCase(reviewReimbursementThunk.fulfilled, (state, action) => {
                applyUpdated(state, action.payload.data);
                toast.success(action.payload.message);
            })
            .addCase(reviewReimbursementThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Review failed");
            })
            .addCase(processReimbursementThunk.fulfilled, (state, action) => {
                applyUpdated(state, action.payload.data);
                toast.success(action.payload.message);
            })
            .addCase(processReimbursementThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Processing failed");
            });
    },
});

export default slice.reducer;
