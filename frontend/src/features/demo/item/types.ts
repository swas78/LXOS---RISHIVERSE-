export type DemoItemStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type DemoItem = {
    id: string;
    title: string;
    description: string | null;
    status: DemoItemStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export type DemoItemListResponse = {
    success: boolean;
    message: string;
    data: DemoItem[];
    pagination: {
        page: number;
        limit: number;
        totalRecords: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
};

export type CreateDemoItemPayload = {
    title: string;
    description?: string | null;
    status?: DemoItemStatus;
};
