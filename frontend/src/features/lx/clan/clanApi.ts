import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type {
    CreateLxClanPayload,
    LxClanItemResponse,
    LxClanListParams,
    LxClanListResponse,
    ManageClanPointsPayload,
    UpdateLxClanPayload,
} from "./types";

export const clanApi = {
    getAll: async (params?: LxClanListParams) => {
        const { data } = await api.get<LxClanListResponse>(ENDPOINTS.LX.CLAN.ALL, { params });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get<LxClanItemResponse>(ENDPOINTS.LX.CLAN.BY_ID(id));
        return data;
    },
    create: async (payload: CreateLxClanPayload) => {
        const { data } = await api.post<LxClanItemResponse>(ENDPOINTS.LX.CLAN.NEW, payload);
        return data;
    },
    update: async (id: string, payload: UpdateLxClanPayload) => {
        const { data } = await api.patch<LxClanItemResponse>(ENDPOINTS.LX.CLAN.BY_ID(id), payload);
        return data;
    },
    remove: async (id: string) => {
        const { data } = await api.delete<LxClanItemResponse>(ENDPOINTS.LX.CLAN.BY_ID(id));
        return data;
    },
    managePoints: async (id: string, payload: ManageClanPointsPayload) => {
        const { data } = await api.post<LxClanItemResponse>(ENDPOINTS.LX.CLAN.POINTS(id), payload);
        return data;
    },
};
