import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type { CreateLxFilePayload, LxFile, LxFileListParams, LxFileListResponse } from "./types";

export const fileApi = {
    getAll: async (params?: LxFileListParams, signal?: AbortSignal) => {
        const { data } = await api.get<LxFileListResponse>(ENDPOINTS.LX.FILE.ALL, {
            params,
            signal,
        });
        return data;
    },
    create: async (payload: CreateLxFilePayload) => {
        const { data } = await api.post<{ success: boolean; message: string; data: LxFile }>(
            ENDPOINTS.LX.FILE.NEW,
            payload,
        );
        return data;
    },
    remove: async (id: string) => {
        const { data } = await api.delete<{ success: boolean; message: string; data: LxFile }>(
            ENDPOINTS.LX.FILE.BY_ID(id),
        );
        return data;
    },
};
