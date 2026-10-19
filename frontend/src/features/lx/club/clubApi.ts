import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type {
    CreateLxClubPayload,
    LxClubItemResponse,
    LxClubListParams,
    LxClubListResponse,
    UpdateLxClubPayload,
} from "./types";

export const clubApi = {
    getAll: async (params?: LxClubListParams, signal?: AbortSignal) => {
        const { data } = await api.get<LxClubListResponse>(ENDPOINTS.LX.CLUB.ALL, {
            params,
            signal,
        });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get<LxClubItemResponse>(ENDPOINTS.LX.CLUB.BY_ID(id));
        return data;
    },
    create: async (payload: CreateLxClubPayload) => {
        const { data } = await api.post<LxClubItemResponse>(ENDPOINTS.LX.CLUB.NEW, payload);
        return data;
    },
    update: async (id: string, payload: UpdateLxClubPayload) => {
        const { data } = await api.patch<LxClubItemResponse>(ENDPOINTS.LX.CLUB.BY_ID(id), payload);
        return data;
    },
    remove: async (id: string) => {
        const { data } = await api.delete<LxClubItemResponse>(ENDPOINTS.LX.CLUB.BY_ID(id));
        return data;
    },
};
