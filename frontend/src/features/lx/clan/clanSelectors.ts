import type { RootState } from "@/store";

export const selectClans = (state: RootState) => state.lxClan.clans;
export const selectCurrentClan = (state: RootState) => state.lxClan.current;
export const selectClansLoading = (state: RootState) => state.lxClan.loading;
export const selectClanDetailLoading = (state: RootState) => state.lxClan.detailLoading;
export const selectClansError = (state: RootState) => state.lxClan.error;
export const selectClansPagination = (state: RootState) => state.lxClan.pagination;
