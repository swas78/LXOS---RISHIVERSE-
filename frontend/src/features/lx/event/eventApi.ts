import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type {
    ApproveEventPayload,
    AvailabilityPayload,
    AvailabilityResponse,
    CreateLxEventPayload,
    LxEventItemResponse,
    LxEventListParams,
    LxEventListResponse,
    UpdateLxEventPayload,
} from "./types";

// getAll accepts array filters (type/status); serialize them as CSV so the
// backend's preprocess splits them back into arrays.
const serializeParams = (params?: LxEventListParams) => {
    if (!params) return undefined;
    const { type, status, ...rest } = params;
    return {
        ...rest,
        ...(type ? { type: Array.isArray(type) ? type.join(",") : type } : {}),
        ...(status ? { status: Array.isArray(status) ? status.join(",") : status } : {}),
    };
};

export const eventApi = {
    getAll: async (params?: LxEventListParams, signal?: AbortSignal) => {
        // The signal was accepted and then dropped, so the hook's .abort() did
        // nothing and superseded searches still raced to resolve.
        const { data } = await api.get<LxEventListResponse>(ENDPOINTS.LX.EVENT.ALL, {
            params: serializeParams(params),
            signal,
        });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get<LxEventItemResponse>(ENDPOINTS.LX.EVENT.BY_ID(id));
        return data;
    },
    create: async (payload: CreateLxEventPayload) => {
        const { data } = await api.post<LxEventItemResponse>(ENDPOINTS.LX.EVENT.NEW, payload);
        return data;
    },
    update: async (id: string, payload: UpdateLxEventPayload) => {
        const { data } = await api.patch<LxEventItemResponse>(
            ENDPOINTS.LX.EVENT.BY_ID(id),
            payload,
        );
        return data;
    },
    remove: async (id: string) => {
        const { data } = await api.delete<LxEventItemResponse>(ENDPOINTS.LX.EVENT.BY_ID(id));
        return data;
    },
    approve: async (id: string, payload: ApproveEventPayload) => {
        const { data } = await api.post<LxEventItemResponse>(
            ENDPOINTS.LX.EVENT.APPROVE(id),
            payload,
        );
        return data;
    },
    complete: async (id: string) => {
        const { data } = await api.post<LxEventItemResponse>(ENDPOINTS.LX.EVENT.COMPLETE(id));
        return data;
    },
    checkAvailability: async (payload: AvailabilityPayload) => {
        const { data } = await api.post<AvailabilityResponse>(
            ENDPOINTS.LX.EVENT.AVAILABILITY,
            payload,
        );
        return data;
    },
};
