export type LxRoomType =
    "CLASSROOM" | "SEMINAR" | "LAB" | "AUDITORIUM" | "MEETING" | "STUDIO" | "OUTDOOR" | "OTHER";

export type LxRoomAmenity =
    "PROJECTOR" | "WHITEBOARD" | "AC" | "SOUND_SYSTEM" | "MIC" | "STAGE" | "WIFI" | "POWER_OUTLETS";

export type LxRoom = {
    id: string;
    name: string;
    building: string | null;
    floor: string | null;
    capacity: number;
    type: LxRoomType;
    amenities: LxRoomAmenity[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export type Pagination = {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
};

export type LxRoomListResponse = {
    success: boolean;
    message: string;
    data: LxRoom[];
    pagination: Pagination;
};

export type CreateLxRoomPayload = {
    name: string;
    building?: string | null;
    floor?: string | null;
    capacity?: number;
    type?: LxRoomType;
    amenities?: LxRoomAmenity[];
    isActive?: boolean;
};

export type UpdateLxRoomPayload = Partial<CreateLxRoomPayload>;

export type LxRoomListParams = {
    search?: string;
    type?: LxRoomType;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: "name" | "capacity" | "type" | "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
};
