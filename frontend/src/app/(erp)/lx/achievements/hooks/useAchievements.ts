"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
    selectAchievementClans,
    selectAchievementClubs,
    selectAchievements,
    selectAchievementsError,
    selectAchievementsLoading,
    selectAchievementsPagination,
    selectCanReviewAchievements,
} from "@/features/lx/achievement/achievementSelectors";
import {
    createAchievementThunk,
    deleteAchievementThunk,
    fetchAchievementClansThunk,
    fetchAchievementClubsThunk,
    fetchAchievementsThunk,
    fetchCurrentActorThunk,
    reviewAchievementThunk,
} from "@/features/lx/achievement/achievementThunks";
import type {
    CreateLxAchievementPayload,
    LxAchievementCategory,
    LxAchievementStatus,
    ReviewLxAchievementPayload,
} from "@/features/lx/achievement/types";

export type PersonChip = { name: string; count: number };

export function useAchievements() {
    const dispatch = useAppDispatch();
    const achievements = useAppSelector(selectAchievements);
    const loading = useAppSelector(selectAchievementsLoading);
    const error = useAppSelector(selectAchievementsError);
    const pagination = useAppSelector(selectAchievementsPagination);
    const clubs = useAppSelector(selectAchievementClubs);
    const clans = useAppSelector(selectAchievementClans);
    const canReview = useAppSelector(selectCanReviewAchievements);

    const [search, setSearch] = useState("");
    const [person, setPerson] = useState("");
    const [category, setCategory] = useState<LxAchievementCategory | "">("");
    const [status, setStatus] = useState<LxAchievementStatus | "">("");
    const debouncedSearch = useDebouncedValue(search, 300);

    const buildParams = () => ({
        search: debouncedSearch || undefined,
        person: person || undefined,
        category: category || undefined,
        status: status || undefined,
        page: 1,
        limit: 60,
        sortBy: "achievedDate" as const,
        sortOrder: "desc" as const,
    });

    useEffect(() => {
        const promise = dispatch(fetchAchievementsThunk(buildParams()));
        return () => promise.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, debouncedSearch, person, category, status]);

    const refresh = () => {
        void dispatch(fetchAchievementsThunk(buildParams()));
    };

    // One-time lookups for the current actor and the club/clan link selects.
    useEffect(() => {
        void dispatch(fetchCurrentActorThunk());
        void dispatch(fetchAchievementClubsThunk());
        void dispatch(fetchAchievementClansThunk());
    }, [dispatch]);

    // Person chips derived from the loaded achievements (creator + participants).
    const personChips = useMemo<PersonChip[]>(() => {
        const counts = new Map<string, number>();
        for (const a of achievements) {
            const names = [a.createdByName, ...a.participants].filter(Boolean);
            const seen = new Set<string>();
            for (const raw of names) {
                const name = raw.trim();
                if (!name || seen.has(name)) continue;
                seen.add(name);
                counts.set(name, (counts.get(name) ?? 0) + 1);
            }
        }
        return [...counts.entries()]
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    }, [achievements]);

    const createAchievement = async (payload: CreateLxAchievementPayload) => {
        const result = await dispatch(createAchievementThunk(payload));
        return createAchievementThunk.fulfilled.match(result);
    };

    const removeAchievement = async (id: string) => {
        const result = await dispatch(deleteAchievementThunk(id));
        return deleteAchievementThunk.fulfilled.match(result);
    };

    const reviewAchievement = async (id: string, payload: ReviewLxAchievementPayload) => {
        const result = await dispatch(reviewAchievementThunk({ id, payload }));
        return reviewAchievementThunk.fulfilled.match(result);
    };

    return {
        achievements,
        loading,
        error,
        pagination,
        clubs,
        clans,
        canReview,
        personChips,
        search,
        setSearch,
        person,
        setPerson,
        category,
        setCategory,
        status,
        setStatus,
        refresh,
        createAchievement,
        removeAchievement,
        reviewAchievement,
    };
}
