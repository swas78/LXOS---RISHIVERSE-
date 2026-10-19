import api from "@/lib/axios";
import { ENDPOINTS } from "@/constants/endpoints";
import type {
    CreateLxRoomPayload,
    LxRoom,
    LxRoomListParams,
    LxRoomListResponse,
    UpdateLxRoomPayload,
} from "./types";

export const roomApi = {
    getAll: async (params?: LxRoomListParams, signal?: AbortSignal) => {
        const { data } = await api.get<LxRoomListResponse>(ENDPOINTS.LX.ROOM.ALL, {
            params,
            signal,
        });
        return data;
    },
    create: async (payload: CreateLxRoomPayload) => {
        const { data } = await api.post<{ success: boolean; message: string; data: LxRoom }>(
            ENDPOINTS.LX.ROOM.NEW,
            payload,
        );
        return data;
    },
    update: async (id: string, payload: UpdateLxRoomPayload) => {
        const { data } = await api.patch<{ success: boolean; message: string; data: LxRoom }>(
            ENDPOINTS.LX.ROOM.BY_ID(id),
            payload,
        );
        return data;
    },
    remove: async (id: string) => {
        const { data } = await api.delete<{ success: boolean; message: string; data: LxRoom }>(
            ENDPOINTS.LX.ROOM.BY_ID(id),
        );
        return data;
    },
};

// ---- Room bookings ---------------------------------------------------------
// Bookings live here rather than in their own feature because the UI only ever
// reaches them through a room. They were previously inline axios calls inside
// BookRoomModal, which put the HTTP surface in a component.

export type RoomAvailability = {
    available: boolean;
    conflicts?: { title: string; startTime: string; endTime: string }[];
};

export type CreateRoomBookingPayload = {
    roomId: string;
    roomName?: string;
    title: string;
    purpose?: string;
    startTime: string;
    endTime: string;
};

export type RoomConflict = {
    source: "BOOKING" | "EVENT";
    id: string;
    title: string;
    status: string;
    startTime: string;
    endTime: string;
};

/** A room plus whether it is free for the window that was asked about. */
export type RoomWithAvailability = LxRoom & {
    available: boolean;
    conflicts: RoomConflict[];
};

export type AvailabilityParams = {
    startTime: string;
    endTime: string;
    search?: string;
    type?: string[];
};

export type BulkBookingPayload = {
    roomIds: string[];
    title: string;
    purpose?: string;
    startTime: string;
    endTime: string;
};

export const roomBookingApi = {
    /** Which rooms are free for a window — counts bookings AND scheduled events. */
    availabilityFor: async (params: AvailabilityParams, signal?: AbortSignal) => {
        const { data } = await api.get<{
            success: boolean;
            message: string;
            data: RoomWithAvailability[];
            meta: { total: number; availableCount: number };
        }>(ENDPOINTS.LX.BOOKING.AVAILABILITY, { params, signal });
        return data;
    },
    /** Claim one or several rooms for a single purpose. All or nothing. */
    createMany: async (payload: BulkBookingPayload) => {
        const { data } = await api.post<{
            success: boolean;
            message: string;
            data: { id: string; roomName: string }[];
        }>(ENDPOINTS.LX.BOOKING.BULK, payload);
        return data;
    },
    checkAvailability: async (payload: { roomId: string; startTime: string; endTime: string }) => {
        const { data } = await api.post<{ success: boolean; message: string } & RoomAvailability>(
            ENDPOINTS.LX.BOOKING.AVAILABILITY,
            payload,
        );
        return data;
    },
    create: async (payload: CreateRoomBookingPayload) => {
        const { data } = await api.post<{ success: boolean; message: string }>(
            ENDPOINTS.LX.BOOKING.NEW,
            payload,
        );
        return data;
    },
};
