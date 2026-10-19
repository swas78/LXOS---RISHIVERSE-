import type { RootState } from "@/store";

export const selectProducts = (state: RootState) => state.lxProduct.products;
export const selectProductsLoading = (state: RootState) => state.lxProduct.loading;
export const selectProductsError = (state: RootState) => state.lxProduct.error;
export const selectProductsPagination = (state: RootState) => state.lxProduct.pagination;
