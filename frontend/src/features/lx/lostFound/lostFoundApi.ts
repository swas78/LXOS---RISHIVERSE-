import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type {
    CreateLxLostFoundPayload,
    LxLostFoundItem,
    LxLostFoundListParams,
    LxLostFoundListResponse,
} from "./types";

type Envelope<T> = { success: boolean; message: string; data: T };

export const lostFoundApi = {
    getAll: async (params?: LxLostFoundListParams, signal?: AbortSignal) => {
        const { data } = await api.get<LxLostFoundListResponse>(ENDPOINTS.LX.LOST_FOUND.ALL, {
            params,
            signal,
        });
        return data;
    },
    create: async (payload: CreateLxLostFoundPayload) => {
        const { data } = await api.post<Envelope<LxLostFoundItem>>(
            ENDPOINTS.LX.LOST_FOUND.NEW,
            payload,
        );
        return data;
    },
    review: async (
        id: string,
        payload: { action: "approve" | "reject"; rejectionReason?: string },
    ) => {
        const { data } = await api.post<Envelope<LxLostFoundItem>>(
            ENDPOINTS.LX.LOST_FOUND.REVIEW(id),
            payload,
        );
        return data;
    },
    resolve: async (id: string, resolutionNote?: string) => {
        const { data } = await api.post<Envelope<LxLostFoundItem>>(
            ENDPOINTS.LX.LOST_FOUND.RESOLVE(id),
            { resolutionNote },
        );
        return data;
    },
    remove: async (id: string) => {
        const { data } = await api.delete<Envelope<LxLostFoundItem>>(
            ENDPOINTS.LX.LOST_FOUND.BY_ID(id),
        );
        return data;
    },
};
