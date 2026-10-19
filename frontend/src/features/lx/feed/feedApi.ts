import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type { LxAchievement } from "@/features/lx/achievement/types";

type Envelope<T> = { success: boolean; message: string; data: T };

export const feedApi = {
    getAll: async (params?: { kind?: string }, signal?: AbortSignal) => {
        const { data } = await api.get<Envelope<LxAchievement[]>>(ENDPOINTS.LX.FEED.ALL, {
            params,
            signal,
        });
        return data.data;
    },
};
