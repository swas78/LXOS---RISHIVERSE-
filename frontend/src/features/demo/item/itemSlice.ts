import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { createItemThunk, deleteItemThunk, fetchItemsThunk } from "./itemThunks";
import type { DemoItem } from "./types";

type ItemState = {
    items: DemoItem[];
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        totalRecords: number;
    };
};

const initialState: ItemState = {
    items: [],
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, totalRecords: 0 },
};

const itemSlice = createSlice({
    name: "demoItem",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchItemsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchItemsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = {
                    page: action.payload.pagination.page,
                    limit: action.payload.pagination.limit,
                    totalRecords: action.payload.pagination.totalRecords,
                };
            })
            .addCase(fetchItemsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load items";
            })
            .addCase(createItemThunk.fulfilled, (state, action) => {
                state.items = [action.payload.data, ...state.items];
                state.pagination.totalRecords += 1;
                toast.success(action.payload.message);
            })
            .addCase(createItemThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Create failed");
            })
            .addCase(deleteItemThunk.fulfilled, (state, action) => {
                state.items = state.items.filter((i) => i.id !== action.payload.data.id);
                state.pagination.totalRecords = Math.max(0, state.pagination.totalRecords - 1);
                toast.success(action.payload.message);
            })
            .addCase(deleteItemThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Delete failed");
            });
    },
});

export default itemSlice.reducer;
