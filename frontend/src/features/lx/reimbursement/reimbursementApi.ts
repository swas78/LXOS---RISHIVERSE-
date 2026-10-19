import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type {
    CreateLxReimbursementPayload,
    LxReimbursementItemResponse,
    LxReimbursementListParams,
    LxReimbursementListResponse,
    ReviewReimbursementPayload,
} from "./types";

export const reimbursementApi = {
    getAll: async (params?: LxReimbursementListParams) => {
        const { data } = await api.get<LxReimbursementListResponse>(
            ENDPOINTS.LX.REIMBURSEMENT.ALL,
            { params },
        );
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get<LxReimbursementItemResponse>(
            ENDPOINTS.LX.REIMBURSEMENT.BY_ID(id),
        );
        return data;
    },
    create: async (payload: CreateLxReimbursementPayload) => {
        const { data } = await api.post<LxReimbursementItemResponse>(
            ENDPOINTS.LX.REIMBURSEMENT.NEW,
            payload,
        );
        return data;
    },
    review: async (id: string, payload: ReviewReimbursementPayload) => {
        const { data } = await api.post<LxReimbursementItemResponse>(
            ENDPOINTS.LX.REIMBURSEMENT.REVIEW(id),
            payload,
        );
        return data;
    },
    // `payoutTxnRef` is the bank/UPI reference for the transfer Finance just made.
    // `payoutRef` (who to pay) is derived server-side and never sent from here.
    process: async (id: string, payoutTxnRef?: string) => {
        const { data } = await api.post<LxReimbursementItemResponse>(
            ENDPOINTS.LX.REIMBURSEMENT.PROCESS(id),
            payoutTxnRef ? { payoutTxnRef } : {},
        );
        return data;
    },
};
