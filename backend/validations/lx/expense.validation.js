import { z } from "zod";
import {
    LX_EXPENSE_CATEGORIES,
    LX_EXPENSE_STATUSES,
    LX_EXPENSE_SORT_BY,
} from "../../constants/lxExpenseConstant.js";
import { attachmentSchema } from "./upload.validation.js";

// Receipts for one expense. `attachmentSchema` is the canonical shape shared
// with every other file-bearing row, so a bill looks the same everywhere.
const billsField = z.array(attachmentSchema).max(6, "at most 6 bills").optional();

const categoryField = z.enum(LX_EXPENSE_CATEGORIES, {
    message: `category must be one of: ${LX_EXPENSE_CATEGORIES.join(", ")}`,
});

export const createExpenseSchema = z.object({
    eventId: z.string().trim().min(1, "eventId is required"),
    eventTitle: z.string().trim().max(200).optional().nullable(),
    title: z.string().trim().min(1, "title is required").max(200),
    description: z.string().trim().max(2000).optional(),
    amount: z.number().min(1, "amount must be at least 1"),
    category: categoryField,
    bills: billsField,
});

export const updateExpenseSchema = z.object({
    eventId: z.string().trim().min(1).optional(),
    eventTitle: z.string().trim().max(200).optional().nullable(),
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).optional(),
    amount: z.number().min(1).optional(),
    category: categoryField.optional(),
    bills: billsField,
});

export const getAllExpensesSchema = z.object({
    eventId: z.preprocess((val) => {
        if (typeof val !== "string") return undefined;
        const trimmed = val.trim();
        return trimmed === "" ? undefined : trimmed;
    }, z.string().optional()),
    status: z.preprocess(
        (val) => {
            if (typeof val === "string") {
                return val
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
            }
            return undefined;
        },
        z.array(z.enum(LX_EXPENSE_STATUSES)).optional(),
    ),
    category: z.preprocess(
        (val) => {
            if (typeof val === "string") {
                return val
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
            }
            return undefined;
        },
        z.array(z.enum(LX_EXPENSE_CATEGORIES)).optional(),
    ),
    page: z.preprocess((val) => {
        if (val === undefined || val === null) return undefined;
        if (typeof val === "string") return parseInt(val, 10);
        return val;
    }, z.number().int().min(1).default(1)),
    limit: z.preprocess((val) => {
        if (val === undefined || val === null) return undefined;
        if (typeof val === "string") return parseInt(val, 10);
        return val;
    }, z.number().int().min(1).max(100).default(10)),
    sortBy: z.enum(LX_EXPENSE_SORT_BY).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const verifyExpenseSchema = z.object({
    action: z.enum(["approve", "reject"], {
        message: "action must be 'approve' or 'reject'",
    }),
    rejectionReason: z.string().trim().max(2000).optional().nullable(),
});
