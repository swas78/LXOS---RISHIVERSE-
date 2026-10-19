import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type { AnalyticsData } from "./types";

type Envelope<T> = { success: boolean; message: string; data: T };

export const analyticsApi = {
    get: async (signal?: AbortSignal) => {
        const { data } = await api.get<Envelope<AnalyticsData>>(ENDPOINTS.LX.ANALYTICS.ALL, {
            signal,
        });
        return data.data;
    },
};
