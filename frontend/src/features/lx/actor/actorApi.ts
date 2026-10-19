import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type { LxActor, LxMember } from "./types";

export const actorApi = {
    getUsers: async () => {
        const { data } = await api.get<{ success: boolean; message: string; data: LxMember[] }>(
            ENDPOINTS.LX.USER.ALL,
        );
        return data;
    },
    getMe: async () => {
        const { data } = await api.get<{ success: boolean; message: string; data: LxActor }>(
            ENDPOINTS.LX.USER.ME,
        );
        return data;
    },
};
