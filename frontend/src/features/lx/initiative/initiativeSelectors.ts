import type { RootState } from "@/store";

export const selectInitiatives = (state: RootState) => state.lxInitiative.initiatives;
export const selectCurrentInitiative = (state: RootState) => state.lxInitiative.current;
export const selectInitiativesLoading = (state: RootState) => state.lxInitiative.loading;
export const selectInitiativesError = (state: RootState) => state.lxInitiative.error;
export const selectInitiativesPagination = (state: RootState) => state.lxInitiative.pagination;
