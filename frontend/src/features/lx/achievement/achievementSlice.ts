import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import {
    createAchievementThunk,
    deleteAchievementThunk,
    fetchAchievementClansThunk,
    fetchAchievementClubsThunk,
    fetchAchievementsThunk,
    fetchCurrentActorThunk,
    reviewAchievementThunk,
} from "./achievementThunks";
import type { LxAchievement, LxActor, LxClanLite, LxClubLite } from "./types";

type AchievementState = {
    achievements: LxAchievement[];
    clubs: LxClubLite[];
    clans: LxClanLite[];
    actor: LxActor | null;
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
    };
};

const initialState: AchievementState = {
    achievements: [],
    clubs: [],
    clans: [],
    actor: null,
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 },
};

const achievementSlice = createSlice({
    name: "lxAchievement",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAchievementsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAchievementsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.achievements = action.payload.data;
                state.pagination = {
                    page: action.payload.pagination.page,
                    limit: action.payload.pagination.limit,
                    totalCount: action.payload.pagination.totalCount,
                    totalPages: action.payload.pagination.totalPages,
                };
            })
            .addCase(fetchAchievementsThunk.rejected, (state, action) => {
                if (action.meta.aborted) return; // superseded by a newer request
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load achievements";
            })
            .addCase(createAchievementThunk.fulfilled, (state, action) => {
                state.achievements = [action.payload.data, ...state.achievements];
                state.pagination.totalCount += 1;
                toast.success(action.payload.message);
            })
            .addCase(createAchievementThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Create failed");
            })
            .addCase(deleteAchievementThunk.fulfilled, (state, action) => {
                state.achievements = state.achievements.filter(
                    (a) => a.id !== action.payload.data.id,
                );
                state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1);
                toast.success(action.payload.message);
            })
            .addCase(deleteAchievementThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Delete failed");
            })
            .addCase(reviewAchievementThunk.fulfilled, (state, action) => {
                const updated = action.payload.data;
                state.achievements = state.achievements.map((a) =>
                    a.id === updated.id ? updated : a,
                );
                toast.success(action.payload.message);
            })
            .addCase(reviewAchievementThunk.rejected, (_state, action) => {
                toast.error((action.payload as string) || "Review failed");
            })
            .addCase(fetchAchievementClubsThunk.fulfilled, (state, action) => {
                state.clubs = action.payload.data;
            })
            .addCase(fetchAchievementClansThunk.fulfilled, (state, action) => {
                state.clans = action.payload.data;
            })
            .addCase(fetchCurrentActorThunk.fulfilled, (state, action) => {
                state.actor = action.payload.data;
            });
    },
});

export default achievementSlice.reducer;
