import type { RootState } from "@/store";

export const selectFiles = (state: RootState) => state.lxFile.files;
export const selectFilesLoading = (state: RootState) => state.lxFile.loading;
export const selectFilesError = (state: RootState) => state.lxFile.error;
export const selectFilesPagination = (state: RootState) => state.lxFile.pagination;
