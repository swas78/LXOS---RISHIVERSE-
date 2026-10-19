import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type {
    CreateLxExpensePayload,
    LxExpenseItemResponse,
    LxExpenseListParams,
    LxExpenseListResponse,
    VerifyExpensePayload,
} from "./types";

export const expenseApi = {
    getAll: async (params?: LxExpenseListParams) => {
        const { data } = await api.get<LxExpenseListResponse>(ENDPOINTS.LX.EXPENSE.ALL, {
            params,
        });
        return data;
    },
    create: async (payload: CreateLxExpensePayload) => {
        const { data } = await api.post<LxExpenseItemResponse>(ENDPOINTS.LX.EXPENSE.NEW, payload);
        return data;
    },
    verify: async (id: string, payload: VerifyExpensePayload) => {
        const { data } = await api.post<LxExpenseItemResponse>(
            ENDPOINTS.LX.EXPENSE.VERIFY(id),
            payload,
        );
        return data;
    },
    remove: async (id: string) => {
        const { data } = await api.delete<LxExpenseItemResponse>(ENDPOINTS.LX.EXPENSE.BY_ID(id));
        return data;
    },
};
