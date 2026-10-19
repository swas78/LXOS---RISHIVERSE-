import type { RootState } from "@/store";

export const selectClubs = (state: RootState) => state.lxClub.clubs;
export const selectCurrentClub = (state: RootState) => state.lxClub.current;
export const selectClubsLoading = (state: RootState) => state.lxClub.loading;
export const selectClubDetailLoading = (state: RootState) => state.lxClub.detailLoading;
export const selectClubsError = (state: RootState) => state.lxClub.error;
export const selectClubsPagination = (state: RootState) => state.lxClub.pagination;
