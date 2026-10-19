import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import {
    createProductThunk,
    deleteProductThunk,
    fetchProductsThunk,
    reviewProductThunk,
} from "./productThunks";
import type { LxProduct } from "./types";

type ProductState = {
    products: LxProduct[];
    loading: boolean;
    error: string | null;
    pagination: { page: number; limit: number; totalCount: number; totalPages: number };
};

const initialState: ProductState = {
    products: [],
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 },
};

const slice = createSlice({
    name: "lxProduct",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProductsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.data;
                state.pagination = {
                    page: action.payload.pagination.page,
                    limit: action.payload.pagination.limit,
                    totalCount: action.payload.pagination.totalCount,
                    totalPages: action.payload.pagination.totalPages,
                };
            })
            .addCase(fetchProductsThunk.rejected, (state, action) => {
                if (action.meta.aborted) return; // superseded by a newer request
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load products";
            })
            .addCase(createProductThunk.fulfilled, (state, action) => {
                // New products are PENDING — prepend so the submitter sees it in "Mine".
                state.products = [action.payload.data, ...state.products];
                state.pagination.totalCount += 1;
                toast.success(action.payload.message);
            })
            .addCase(createProductThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Submit failed");
            })
            .addCase(reviewProductThunk.fulfilled, (state, action) => {
                state.products = state.products.map((p) =>
                    p.id === action.payload.data.id ? action.payload.data : p,
                );
                toast.success(action.payload.message);
            })
            .addCase(reviewProductThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Review failed");
            })
            .addCase(deleteProductThunk.fulfilled, (state, action) => {
                state.products = state.products.filter((p) => p.id !== action.payload.data.id);
                state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1);
                toast.success(action.payload.message);
            })
            .addCase(deleteProductThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Delete failed");
            });
    },
});

export default slice.reducer;
