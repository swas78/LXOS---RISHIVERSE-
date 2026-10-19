import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type { BudgetSummary } from "./types";

type Envelope<T> = { success: boolean; message: string; data: T };

export const budgetApi = {
    getSummary: async (signal?: AbortSignal) => {
        const { data } = await api.get<Envelope<BudgetSummary>>(ENDPOINTS.LX.BUDGET.SUMMARY, {
            signal,
        });
        return data.data;
    },
};
