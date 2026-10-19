import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type { AccessOverview, AssignPayload, RemovePayload } from "./types";

export const accessApi = {
    getAll: async (signal?: AbortSignal) => {
        const { data } = await api.get<{ success: boolean; data: AccessOverview }>(
            ENDPOINTS.LX.ACCESS.ALL,
            { signal },
        );
        return data.data;
    },
    assign: async (payload: AssignPayload) => {
        const { data } = await api.post<{ success: boolean; message: string }>(
            ENDPOINTS.LX.ACCESS.ASSIGN,
            payload,
        );
        return data;
    },
    remove: async (payload: RemovePayload) => {
        const { data } = await api.post<{ success: boolean; message: string }>(
            ENDPOINTS.LX.ACCESS.REMOVE,
            payload,
        );
        return data;
    },
};
