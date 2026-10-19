import type { LxAttachment } from "@/features/upload/uploadApi";

export type LxExpenseCategory =
    "VENUE" | "FOOD" | "EQUIPMENT" | "DECORATION" | "PRIZES" | "MARKETING" | "OTHER";

export type LxExpenseStatus = "PENDING" | "APPROVED" | "REJECTED";

export type LxExpense = {
    id: string;
    eventId: string;
    eventTitle: string | null;
    title: string;
    description: string;
    amount: number;
    category: LxExpenseCategory;
    /** Receipts. Reads arrive with `url` resolved; writes carry `s3Path` only. */
    bills: LxAttachment[];
    submittedByRef: string;
    submittedByName: string;
    status: LxExpenseStatus;
    verifiedByRef: string | null;
    verifiedByName: string | null;
    verifiedAt: string | null;
    rejectionReason: string | null;
    paidDate: string | null;
    budgetApplied: boolean;
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

export type LxExpenseListResponse = {
    success: boolean;
    message: string;
    data: LxExpense[];
    pagination: Pagination;
};

export type LxExpenseItemResponse = {
    success: boolean;
    message: string;
    data: LxExpense;
};

export type CreateLxExpensePayload = {
    eventId: string;
    eventTitle?: string | null;
    title: string;
    description?: string;
    amount: number;
    category?: LxExpenseCategory;
    bills?: LxAttachment[];
};

export type LxExpenseListParams = {
    eventId?: string;
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "amount" | "status";
    sortOrder?: "asc" | "desc";
};

export type VerifyExpensePayload = {
    action: "approve" | "reject";
    rejectionReason?: string;
};
