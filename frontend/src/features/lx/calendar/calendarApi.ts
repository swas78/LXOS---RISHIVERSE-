import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type { CalendarEvent } from "./types";

type Envelope<T> = { success: boolean; message: string; data: T };

export const calendarApi = {
    getAll: async (
        params?: { from?: string; to?: string; type?: string },
        signal?: AbortSignal,
    ) => {
        const { data } = await api.get<Envelope<CalendarEvent[]>>(ENDPOINTS.LX.CALENDAR.ALL, {
            params,
            signal,
        });
        return data.data;
    },
};
