export type LxFileType = "BILL" | "REPORT" | "POSTER" | "DOCUMENT" | "OTHER";

export type LxFile = {
    id: string;
    filename: string;
    originalName: string;
    path: string;
    mimeType: string | null;
    size: number;
    type: LxFileType;
    eventId: string | null;
    clubId: string | null;
    semester: string;
    tags: string[];
    description: string | null;
    uploadedByRef: string;
    uploadedByName: string;
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

export type LxFileListResponse = {
    success: boolean;
    message: string;
    data: LxFile[];
    pagination: Pagination;
};

export type CreateLxFilePayload = {
    filename: string;
    originalName: string;
    path: string;
    mimeType?: string | null;
    size?: number;
    type?: LxFileType;
    tags?: string[];
    eventId?: string | null;
    clubId?: string | null;
    semester?: string;
    description?: string | null;
};

export type LxFileListParams = {
    search?: string;
    type?: LxFileType;
    tag?: string;
    eventId?: string;
    clubId?: string;
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "originalName" | "size" | "type";
    sortOrder?: "asc" | "desc";
};
