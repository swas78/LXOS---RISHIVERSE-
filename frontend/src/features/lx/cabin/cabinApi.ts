import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type {
    CreateLxCabinBookingPayload,
    LxCabin,
    LxCabinBlock,
    LxCabinBoard,
    LxCabinBooking,
    LxCabinBookingAction,
    LxDeskBoard,
    LxDirectoryPerson,
    LxEnvelope,
} from "./types";

export const cabinApi = {
    // ---- Everyone ----------------------------------------------------------
    getBoard: async (signal?: AbortSignal) => {
        const { data } = await api.get<LxEnvelope<LxCabinBoard>>(ENDPOINTS.LX.CABIN.BOARD, {
            signal,
        });
        return data;
    },
    searchDirectory: async (q: string, signal?: AbortSignal) => {
        const { data } = await api.get<LxEnvelope<{ results: LxDirectoryPerson[] }>>(
            ENDPOINTS.LX.CABIN.DIRECTORY,
            { params: { q }, signal },
        );
        return data;
    },
    book: async (payload: CreateLxCabinBookingPayload) => {
        const { data } = await api.post<LxEnvelope<LxCabinBooking>>(
            ENDPOINTS.LX.CABIN.BOOK,
            payload,
        );
        return data;
    },
    act: async (id: string, action: LxCabinBookingAction) => {
        const { data } = await api.patch<LxEnvelope<LxCabinBooking>>(
            ENDPOINTS.LX.CABIN.BOOKING(id),
            { action },
        );
        return data;
    },

    // ---- Library desk ------------------------------------------------------
    getDeskBoard: async (signal?: AbortSignal) => {
        const { data } = await api.get<LxEnvelope<LxDeskBoard>>(ENDPOINTS.LX.CABIN.DESK_BOARD, {
            signal,
        });
        return data;
    },
    listCabins: async (signal?: AbortSignal) => {
        const { data } = await api.get<LxEnvelope<LxCabin[]>>(ENDPOINTS.LX.CABIN.ALL, { signal });
        return data;
    },
    updateCabin: async (id: string, payload: Partial<LxCabin>) => {
        const { data } = await api.patch<LxEnvelope<LxCabin>>(
            ENDPOINTS.LX.CABIN.BY_ID(id),
            payload,
        );
        return data;
    },
    createCabin: async (payload: Partial<LxCabin>) => {
        const { data } = await api.post<LxEnvelope<LxCabin>>(ENDPOINTS.LX.CABIN.NEW, payload);
        return data;
    },
    removeCabin: async (id: string) => {
        const { data } = await api.delete<LxEnvelope<LxCabin>>(ENDPOINTS.LX.CABIN.BY_ID(id));
        return data;
    },
    listBlocks: async (signal?: AbortSignal) => {
        const { data } = await api.get<LxEnvelope<LxCabinBlock[]>>(ENDPOINTS.LX.CABIN.BLOCKS, {
            signal,
        });
        return data;
    },
    createBlock: async (payload: { memberRef: string; days?: number; note?: string }) => {
        const { data } = await api.post<LxEnvelope<LxCabinBlock>>(
            ENDPOINTS.LX.CABIN.BLOCK_NEW,
            payload,
        );
        return data;
    },
    liftBlock: async (id: string, reason?: string) => {
        const { data } = await api.patch<LxEnvelope<LxCabinBlock>>(
            ENDPOINTS.LX.CABIN.BLOCK_LIFT(id),
            { reason },
        );
        return data;
    },
};
