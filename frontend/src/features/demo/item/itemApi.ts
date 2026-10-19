import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type { CreateDemoItemPayload, DemoItem, DemoItemListResponse } from "./types";

export const itemApi = {
    getAll: async (params?: { search?: string; page?: number; limit?: number }) => {
        const { data } = await api.get<DemoItemListResponse>(ENDPOINTS.DEMO.ITEM.ALL, { params });
        return data;
    },
    create: async (payload: CreateDemoItemPayload) => {
        const { data } = await api.post<{ success: boolean; message: string; data: DemoItem }>(
            ENDPOINTS.DEMO.ITEM.NEW,
            payload,
        );
        return data;
    },
    remove: async (id: string) => {
        const { data } = await api.delete<{ success: boolean; message: string; data: DemoItem }>(
            ENDPOINTS.DEMO.ITEM.BY_ID(id),
        );
        return data;
    },
};
