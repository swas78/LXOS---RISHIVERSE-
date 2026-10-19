import type { RootState } from "@/store";

export const selectDemoItems = (state: RootState) => state.demoItem.items;
export const selectDemoItemsLoading = (state: RootState) => state.demoItem.loading;
export const selectDemoItemsError = (state: RootState) => state.demoItem.error;
export const selectDemoItemsPagination = (state: RootState) => state.demoItem.pagination;
