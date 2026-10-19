"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    selectDemoItems,
    selectDemoItemsError,
    selectDemoItemsLoading,
    selectDemoItemsPagination,
} from "@/features/demo/item/itemSelectors";
import { createItemThunk, deleteItemThunk, fetchItemsThunk } from "@/features/demo/item/itemThunks";
import type { CreateDemoItemPayload } from "@/features/demo/item/types";

export function useDemoItems() {
    const dispatch = useAppDispatch();
    const items = useAppSelector(selectDemoItems);
    const loading = useAppSelector(selectDemoItemsLoading);
    const error = useAppSelector(selectDemoItemsError);
    const pagination = useAppSelector(selectDemoItemsPagination);
    const [search, setSearch] = useState("");

    const refresh = useCallback(() => {
        void dispatch(fetchItemsThunk({ search: search || undefined, page: 1, limit: 20 }));
    }, [dispatch, search]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const createItem = async (payload: CreateDemoItemPayload) => {
        const result = await dispatch(createItemThunk(payload));
        return createItemThunk.fulfilled.match(result);
    };

    const removeItem = async (id: string) => {
        const result = await dispatch(deleteItemThunk(id));
        return deleteItemThunk.fulfilled.match(result);
    };

    return {
        items,
        loading,
        error,
        pagination,
        search,
        setSearch,
        refresh,
        createItem,
        removeItem,
    };
}
