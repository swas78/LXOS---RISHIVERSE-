import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type { LxReport, RolloverPayload } from "./types";

export const reportApi = {
    getSemesters: async (signal?: AbortSignal) => {
        const { data } = await api.get<{ data: { semesters: string[]; current: string | null } }>(
            ENDPOINTS.LX.REPORT.SEMESTERS,
            { signal },
        );
        return data.data;
    },
    get: async (semester?: string, signal?: AbortSignal) => {
        const { data } = await api.get<{ data: LxReport }>(ENDPOINTS.LX.REPORT.ALL, {
            params: semester ? { semester } : {},
            signal,
        });
        return data.data;
    },
    rollover: async (payload: RolloverPayload) => {
        const { data } = await api.post<{ message: string }>(ENDPOINTS.LX.REPORT.ROLLOVER, payload);
        return data;
    },
    /**
     * The CSV comes back as a blob, so the browser download lives here with the
     * rest of the HTTP surface rather than in the page. A page that reaches for
     * axios has quietly become a data layer.
     */
    downloadCsv: async (semester?: string) => {
        const res = await api.get(ENDPOINTS.LX.REPORT.CSV, {
            params: semester ? { semester } : {},
            responseType: "blob",
        });
        return new Blob([res.data], { type: "text/csv" });
    },
};
