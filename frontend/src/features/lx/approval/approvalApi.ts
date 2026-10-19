import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type { ActPayload, ApprovalItem, ApprovalMeta } from "./types";

export const approvalApi = {
    getAll: async (params?: { type?: string }, signal?: AbortSignal) => {
        const { data } = await api.get<{
            success: boolean;
            message: string;
            data: ApprovalItem[];
            meta: ApprovalMeta;
        }>(ENDPOINTS.LX.APPROVAL.ALL, { params, signal });
        return { items: data.data, meta: data.meta };
    },
    act: async (payload: ActPayload) => {
        const { data } = await api.post<{ success: boolean; message: string }>(
            ENDPOINTS.LX.APPROVAL.ACT,
            payload,
        );
        return data;
    },
};
