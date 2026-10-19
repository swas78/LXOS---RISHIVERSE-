import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type {
    CreateLxInitiativePayload,
    LxInitiativeItemResponse,
    LxInitiativeListParams,
    LxInitiativeListResponse,
    UpdateLxInitiativePayload,
} from "./types";

export const initiativeApi = {
    getAll: async (params?: LxInitiativeListParams) => {
        const { data } = await api.get<LxInitiativeListResponse>(ENDPOINTS.LX.INITIATIVE.ALL, {
            params,
        });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get<LxInitiativeItemResponse>(ENDPOINTS.LX.INITIATIVE.BY_ID(id));
        return data;
    },
    create: async (payload: CreateLxInitiativePayload) => {
        const { data } = await api.post<LxInitiativeItemResponse>(
            ENDPOINTS.LX.INITIATIVE.NEW,
            payload,
        );
        return data;
    },
    update: async (id: string, payload: UpdateLxInitiativePayload) => {
        const { data } = await api.patch<LxInitiativeItemResponse>(
            ENDPOINTS.LX.INITIATIVE.BY_ID(id),
            payload,
        );
        return data;
    },
    remove: async (id: string) => {
        const { data } = await api.delete<LxInitiativeItemResponse>(
            ENDPOINTS.LX.INITIATIVE.BY_ID(id),
        );
        return data;
    },
};
