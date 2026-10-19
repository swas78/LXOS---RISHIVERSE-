import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { actOnApprovalThunk, fetchApprovalsThunk } from "./approvalThunks";
import type { ApprovalItem, ApprovalMeta } from "./types";

type State = {
    items: ApprovalItem[];
    meta: ApprovalMeta | null;
    loading: boolean;
    error: string | null;
};
const initialState: State = { items: [], meta: null, loading: false, error: null };

const slice = createSlice({
    name: "lxApproval",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchApprovalsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchApprovalsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.meta = action.payload.meta;
            })
            .addCase(fetchApprovalsThunk.rejected, (state, action) => {
                if (action.meta.aborted) return;
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load approvals";
            })
            .addCase(actOnApprovalThunk.fulfilled, (state, action) => {
                const { payload } = action.payload;
                // An approved reimbursement has not left the queue — it moves to
                // Finance for processing, so it is re-staged rather than removed.
                if (payload.type === "REIMBURSEMENT" && payload.action === "approve") {
                    state.items = state.items.map((i) =>
                        i.id === payload.id && i.type === payload.type
                            ? { ...i, status: "APPROVED", stage: "FINANCE" }
                            : i,
                    );
                } else {
                    state.items = state.items.filter(
                        (i) => !(i.id === payload.id && i.type === payload.type),
                    );
                }
                toast.success(action.payload.message);
            })
            .addCase(actOnApprovalThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Action failed");
            });
    },
});

export default slice.reducer;
