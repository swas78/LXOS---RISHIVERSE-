import type { LxAttachment } from "@/features/upload/uploadApi";

export type LxReimbursementCategory =
    "FOOD" | "TRAVEL" | "MATERIALS" | "EQUIPMENT" | "PRINTING" | "ACCOMMODATION" | "OTHER";

export type LxReimbursementStatus = "PENDING" | "APPROVED" | "REJECTED" | "PROCESSED";

/** Bills are canonical upload attachments — same shape everything else stores. */
export type LxBill = LxAttachment;

export type LxReimbursement = {
    id: string;
    title: string;
    description: string;
    amount: number;
    expenseDate: string;
    category: LxReimbursementCategory;
    eventId: string | null;
    eventTitle: string | null;
    purpose: string;
    clubId: string | null;
    clubName: string | null;
    clanId: string | null;
    clanName: string | null;
    budgetDeducted: boolean;
    // WHO to pay: "student-bank:<enrollmentNo>". Derived at submit time; read-only.
    payoutRef: string | null;
    // The bank/UPI transaction reference Finance records once the money moved.
    payoutTxnRef: string | null;
    bills: LxBill[];
    submittedByRef: string;
    submittedByName: string;
    status: LxReimbursementStatus;
    reviewedByRef: string | null;
    reviewedByName: string | null;
    reviewedAt: string | null;
    processedByRef: string | null;
    processedByName: string | null;
    processedAt: string | null;
    rejectionReason: string | null;
    notes: string | null;
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

export type LxReimbursementListResponse = {
    success: boolean;
    message: string;
    data: LxReimbursement[];
    pagination: Pagination;
};

export type LxReimbursementItemResponse = {
    success: boolean;
    message: string;
    data: LxReimbursement;
};

export type CreateLxReimbursementPayload = {
    title: string;
    description?: string;
    amount: number;
    expenseDate: string;
    category: LxReimbursementCategory;
    eventId?: string | null;
    eventTitle?: string | null;
    purpose?: string;
    clubId?: string | null;
    clubName?: string | null;
    clanId?: string | null;
    clanName?: string | null;
    // At least one is required — a claim without a receipt is not reviewable.
    bills: LxBill[];
    notes?: string | null;
};

export type ProcessReimbursementPayload = {
    payoutTxnRef?: string;
};

export type LxReimbursementListParams = {
    search?: string;
    status?: string;
    category?: string;
    submittedByRef?: string;
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "updatedAt" | "amount" | "expenseDate" | "status";
    sortOrder?: "asc" | "desc";
};

export type ReviewReimbursementPayload = {
    action: "approve" | "reject";
    rejectionReason?: string;
};
