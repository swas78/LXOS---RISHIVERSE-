"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
    selectProducts,
    selectProductsError,
    selectProductsLoading,
    selectProductsPagination,
} from "@/features/lx/product/productSelectors";
import {
    createProductThunk,
    deleteProductThunk,
    fetchProductsThunk,
    reviewProductThunk,
} from "@/features/lx/product/productThunks";
import type {
    CreateLxProductPayload,
    LxProductCategory,
    ReviewProductPayload,
} from "@/features/lx/product/types";

export type ProductScope = "SHOWCASE" | "PENDING" | "MINE";

export function useProducts() {
    const dispatch = useAppDispatch();
    const products = useAppSelector(selectProducts);
    const loading = useAppSelector(selectProductsLoading);
    const error = useAppSelector(selectProductsError);
    const pagination = useAppSelector(selectProductsPagination);
    const actor = useAppSelector((s) => s.lxActor.current);
    const canReview = actor?.role === "ADMIN" || actor?.role === "LX_TEAM";

    const [scope, setScope] = useState<ProductScope>("SHOWCASE");
    const [search, setSearchRaw] = useState("");
    const [category, setCategoryRaw] = useState<LxProductCategory | "">("");
    const debouncedSearch = useDebouncedValue(search, 300);

    // Real pagination. These lists used to ask for 60 (or 48) rows in one go
    // and show only a count, so "Showing 1 to 10 of 50" would have been a
    // lie and a long list fetched everything. 10 is core's default page size.
    const [page, setPage] = useState(1);
    const limit = 10;

    const buildParams = () => {
        const params: Record<string, unknown> = {
            search: debouncedSearch || undefined,
            category: category || undefined,
            limit: 48,
            sortBy: "createdAt",
            sortOrder: "desc",
        };
        if (scope === "SHOWCASE") params.status = "APPROVED";
        if (scope === "PENDING") params.status = "PENDING";
        if (scope === "MINE") params.createdByRef = actor?.referenceId;
        return params;
    };

    useEffect(() => {
        const promise = dispatch(fetchProductsThunk(buildParams()));
        return () => promise.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, scope, debouncedSearch, category, actor?.referenceId, page, limit]);

    // Changing a filter returns to page 1 — staying on page 4 of the previous
    // result set usually lands on nothing. Done in the setter rather than an
    // effect because it is caused by an event, not by state syncing.
    const setSearch = (v: Parameters<typeof setSearchRaw>[0]) => {
        setSearchRaw(v);
        setPage(1);
    };
    const setCategory = (v: Parameters<typeof setCategoryRaw>[0]) => {
        setCategoryRaw(v);
        setPage(1);
    };

    const refresh = () => {
        void dispatch(fetchProductsThunk(buildParams()));
    };

    const createProduct = async (payload: CreateLxProductPayload) => {
        const result = await dispatch(createProductThunk(payload));
        return createProductThunk.fulfilled.match(result);
    };

    const reviewProduct = async (id: string, payload: ReviewProductPayload) => {
        const result = await dispatch(reviewProductThunk({ id, payload }));
        return reviewProductThunk.fulfilled.match(result);
    };

    const removeProduct = async (id: string) => {
        const result = await dispatch(deleteProductThunk(id));
        return deleteProductThunk.fulfilled.match(result);
    };

    return {
        page,
        setPage,
        limit,
        products,
        loading,
        error,
        pagination,
        actor,
        canReview,
        scope,
        setScope,
        search,
        setSearch,
        category,
        setCategory,
        refresh,
        createProduct,
        reviewProduct,
        removeProduct,
    };
}
