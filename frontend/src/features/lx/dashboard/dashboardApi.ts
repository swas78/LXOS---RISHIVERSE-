import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type { DashboardStats } from "./types";

type Envelope<T> = { success: boolean; message: string; data: T };

export const dashboardApi = {
    getStats: async (signal?: AbortSignal) => {
        const { data } = await api.get<Envelope<DashboardStats>>(ENDPOINTS.LX.DASHBOARD.STATS, {
            signal,
        });
        return data.data;
    },
};
