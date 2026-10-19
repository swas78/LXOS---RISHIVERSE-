import type { RootState } from "@/store";

export const selectLostFoundItems = (s: RootState) => s.lxLostFound.items;
export const selectLostFoundCounts = (s: RootState) => s.lxLostFound.counts;
export const selectLostFoundLoading = (s: RootState) => s.lxLostFound.loading;
export const selectLostFoundActing = (s: RootState) => s.lxLostFound.acting;
export const selectLostFoundError = (s: RootState) => s.lxLostFound.error;
export const selectLostFoundTotal = (s: RootState) => s.lxLostFound.pagination.totalCount;
