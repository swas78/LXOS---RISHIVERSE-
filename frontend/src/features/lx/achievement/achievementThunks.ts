import { createAsyncThunk } from "@reduxjs/toolkit";
import { extractApiErrorMessage } from "@/utility/errorHelper";
import { achievementApi } from "./achievementApi";
import type {
    CreateLxAchievementPayload,
    LxAchievementListParams,
    ReviewLxAchievementPayload,
} from "./types";

export const fetchAchievementsThunk = createAsyncThunk(
    "lxAchievement/fetchAll",
    async (params: LxAchievementListParams | undefined, { rejectWithValue, signal }) => {
        try {
            return await achievementApi.getAll(params, signal);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load achievements"));
        }
    },
);

export const createAchievementThunk = createAsyncThunk(
    "lxAchievement/create",
    async (payload: CreateLxAchievementPayload, { rejectWithValue }) => {
        try {
            return await achievementApi.create(payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to create achievement"));
        }
    },
);

export const deleteAchievementThunk = createAsyncThunk(
    "lxAchievement/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            return await achievementApi.remove(id);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to delete achievement"));
        }
    },
);

export const reviewAchievementThunk = createAsyncThunk(
    "lxAchievement/review",
    async (
        { id, payload }: { id: string; payload: ReviewLxAchievementPayload },
        { rejectWithValue },
    ) => {
        try {
            return await achievementApi.review(id, payload);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to review achievement"));
        }
    },
);

export const fetchAchievementClubsThunk = createAsyncThunk(
    "lxAchievement/fetchClubs",
    async (_: void, { rejectWithValue }) => {
        try {
            return await achievementApi.getClubs();
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load clubs"));
        }
    },
);

export const fetchAchievementClansThunk = createAsyncThunk(
    "lxAchievement/fetchClans",
    async (_: void, { rejectWithValue }) => {
        try {
            return await achievementApi.getClans();
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load clans"));
        }
    },
);

export const fetchCurrentActorThunk = createAsyncThunk(
    "lxAchievement/fetchMe",
    async (_: void, { rejectWithValue }) => {
        try {
            return await achievementApi.getMe();
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load current user"));
        }
    },
);
