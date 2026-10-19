export type ApprovalType =
    "EVENT" | "ACHIEVEMENT" | "REIMBURSEMENT" | "EXPENSE" | "PRODUCT" | "BOOKING" | "LOST_FOUND";

export type ApprovalItem = {
    id: string;
    type: ApprovalType;
    title: string;
    subtitle: string;
    requestedBy: string;
    date: string;
    amount: number | null;
    status: string;
    /** Set client-side when an item moves to a later stage rather than leaving. */
    stage?: string;
    raw: Record<string, unknown>;
};

export type ApprovalMeta = { counts: Record<string, number> };

export type ActPayload = {
    type: ApprovalType;
    id: string;
    action: "approve" | "reject" | "process";
    rejectionReason?: string;
};
