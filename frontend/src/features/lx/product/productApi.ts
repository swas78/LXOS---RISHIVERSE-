import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type {
    CreateLxProductPayload,
    LxProductItemResponse,
    LxProductListParams,
    LxProductListResponse,
    ReviewProductPayload,
} from "./types";

export const productApi = {
    getAll: async (params?: LxProductListParams, signal?: AbortSignal) => {
        const { data } = await api.get<LxProductListResponse>(ENDPOINTS.LX.PRODUCT.ALL, {
            params,
            signal,
        });
        return data;
    },
    create: async (payload: CreateLxProductPayload) => {
        const { data } = await api.post<LxProductItemResponse>(ENDPOINTS.LX.PRODUCT.NEW, payload);
        return data;
    },
    review: async (id: string, payload: ReviewProductPayload) => {
        const { data } = await api.post<LxProductItemResponse>(
            ENDPOINTS.LX.PRODUCT.REVIEW(id),
            payload,
        );
        return data;
    },
    remove: async (id: string) => {
        const { data } = await api.delete<LxProductItemResponse>(ENDPOINTS.LX.PRODUCT.BY_ID(id));
        return data;
    },
};
