import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type {
    CreateLxAchievementPayload,
    LxAchievementItemResponse,
    LxAchievementListParams,
    LxAchievementListResponse,
    LxActor,
    LxClanLite,
    LxClubLite,
    ReviewLxAchievementPayload,
} from "./types";

export const achievementApi = {
    getAll: async (params?: LxAchievementListParams, signal?: AbortSignal) => {
        // Was accepted and dropped — the hook's .abort() had no effect.
        const { data } = await api.get<LxAchievementListResponse>(ENDPOINTS.LX.ACHIEVEMENT.ALL, {
            params,
            signal,
        });
        return data;
    },
    create: async (payload: CreateLxAchievementPayload) => {
        const { data } = await api.post<LxAchievementItemResponse>(
            ENDPOINTS.LX.ACHIEVEMENT.NEW,
            payload,
        );
        return data;
    },
    remove: async (id: string) => {
        const { data } = await api.delete<LxAchievementItemResponse>(
            ENDPOINTS.LX.ACHIEVEMENT.BY_ID(id),
        );
        return data;
    },
    review: async (id: string, payload: ReviewLxAchievementPayload) => {
        const { data } = await api.post<LxAchievementItemResponse>(
            ENDPOINTS.LX.ACHIEVEMENT.REVIEW(id),
            payload,
        );
        return data;
    },
    // Club / clan lookups for the link selects on the Add form.
    getClubs: async () => {
        const { data } = await api.get<{ success: boolean; message: string; data: LxClubLite[] }>(
            ENDPOINTS.LX.CLUB.ALL,
            { params: { limit: 100, sortBy: "name", sortOrder: "asc" } },
        );
        return data;
    },
    getClans: async () => {
        const { data } = await api.get<{ success: boolean; message: string; data: LxClanLite[] }>(
            ENDPOINTS.LX.CLAN.ALL,
            { params: { limit: 100 } },
        );
        return data;
    },
    // Current acting user — used to gate the reviewer (Approve/Reject) controls.
    getMe: async () => {
        const { data } = await api.get<{ success: boolean; message: string; data: LxActor }>(
            ENDPOINTS.LX.USER.ME,
        );
        return data;
    },
};
