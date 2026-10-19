"use client";

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    selectClanDetailLoading,
    selectClans,
    selectClansError,
    selectClansLoading,
    selectCurrentClan,
} from "@/features/lx/clan/clanSelectors";
import {
    createClanThunk,
    deleteClanThunk,
    fetchClanByIdThunk,
    fetchClansThunk,
    manageClanPointsThunk,
    updateClanThunk,
} from "@/features/lx/clan/clanThunks";
import type {
    CreateLxClanPayload,
    ManageClanPointsPayload,
    UpdateLxClanPayload,
} from "@/features/lx/clan/types";

// Leaderboard hook: loads all clans ranked by points (desc).
export function useClans() {
    const dispatch = useAppDispatch();
    const clans = useAppSelector(selectClans);
    const loading = useAppSelector(selectClansLoading);
    const error = useAppSelector(selectClansError);

    const refresh = useCallback(() => {
        void dispatch(
            fetchClansThunk({
                page: 1,
                limit: 20,
                sortBy: "points",
                sortOrder: "desc",
            }),
        );
    }, [dispatch]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const createClan = async (payload: CreateLxClanPayload) => {
        const result = await dispatch(createClanThunk(payload));
        return createClanThunk.fulfilled.match(result);
    };

    const updateClan = async (id: string, payload: UpdateLxClanPayload) => {
        const result = await dispatch(updateClanThunk({ id, payload }));
        return updateClanThunk.fulfilled.match(result);
    };

    const removeClan = async (id: string) => {
        const result = await dispatch(deleteClanThunk(id));
        return deleteClanThunk.fulfilled.match(result);
    };

    const managePoints = async (id: string, payload: ManageClanPointsPayload) => {
        const result = await dispatch(manageClanPointsThunk({ id, payload }));
        return manageClanPointsThunk.fulfilled.match(result);
    };

    return { clans, loading, error, refresh, createClan, updateClan, removeClan, managePoints };
}

// Detail hook: loads a single clan (with point history).
export function useClan(id: string) {
    const dispatch = useAppDispatch();
    const clan = useAppSelector(selectCurrentClan);
    const loading = useAppSelector(selectClanDetailLoading);
    const error = useAppSelector(selectClansError);

    const refresh = useCallback(() => {
        if (id) void dispatch(fetchClanByIdThunk(id));
    }, [dispatch, id]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const managePoints = async (payload: ManageClanPointsPayload) => {
        const result = await dispatch(manageClanPointsThunk({ id, payload }));
        return manageClanPointsThunk.fulfilled.match(result);
    };

    return { clan: clan && clan.id === id ? clan : null, loading, error, refresh, managePoints };
}
