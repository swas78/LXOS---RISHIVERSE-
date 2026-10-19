import type { RootState } from "@/store";

export const selectReimbursements = (state: RootState) => state.lxReimbursement.reimbursements;
export const selectReimbursement = (state: RootState) => state.lxReimbursement.selected;
export const selectReimbursementsLoading = (state: RootState) => state.lxReimbursement.loading;
export const selectReimbursementDetailLoading = (state: RootState) =>
    state.lxReimbursement.detailLoading;
export const selectReimbursementsError = (state: RootState) => state.lxReimbursement.error;
export const selectReimbursementsPagination = (state: RootState) =>
    state.lxReimbursement.pagination;
