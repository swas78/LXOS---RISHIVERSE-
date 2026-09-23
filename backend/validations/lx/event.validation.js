import { z } from "zod";
import { isPaiseExact } from "../../helper/lxMoney.js";
import {
    LX_EVENT_TYPES,
    LX_EVENT_STATUSES,
    LX_EVENT_SORT_BY,
} from "../../constants/lxEventConstant.js";

// A single logistical requirement line for an event.
const requirementField = z
    .array(
        z
            .object({
                item: z.string().trim().min(1, "requirement item is required").max(200),
                quantity: z.number().int().min(0).optional(),
                estimatedCost: z.number().min(0).optional(),
            })
            .passthrough(),
    )
    .optional();

const stringArrayField = z.array(z.string().trim().min(1)).optional();

export const createEventSchema = z.object({
    title: z.string().trim().min(1, "title is required").max(200),
    description: z.string().trim().min(1, "description is required").max(5000),
    type: z.enum(LX_EVENT_TYPES, {
        message: `type must be one of: ${LX_EVENT_TYPES.join(", ")}`,
    }),
    clubId: z.string().trim().optional().nullable(),
    clubName: z.string().trim().max(200).optional().nullable(),
    clanId: z.string().trim().optional().nullable(),
    clanName: z.string().trim().max(200).optional().nullable(),
    startDate: z.coerce.date({
        message: "startDate must be a valid date",
    }),
    endDate: z.coerce.date({
        message: "endDate must be a valid date",
    }),
    roomIds: stringArrayField,
    roomNames: stringArrayField,
    location: z.string().trim().max(300).optional(),
    requirements: requirementField,
    budgetAllocated: z
        .number()
        .min(0)
        .optional()
        .refine(
            (v) => v === undefined || v === null || isPaiseExact(v),
            "amount cannot be finer than paise (2 decimal places)",
        ),
    attendees: z.number().int().min(0).optional(),
    poster: z.string().trim().max(2000).optional().nullable(),
});

export const updateEventSchema = z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).max(5000).optional(),
    type: z
        .enum(LX_EVENT_TYPES, {
            message: `type must be one of: ${LX_EVENT_TYPES.join(", ")}`,
        })
        .optional(),
    clubId: z.string().trim().optional().nullable(),
    clubName: z.string().trim().max(200).optional().nullable(),
    clanId: z.string().trim().optional().nullable(),
    clanName: z.string().trim().max(200).optional().nullable(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    roomIds: stringArrayField,
    roomNames: stringArrayField,
    location: z.string().trim().max(300).optional(),
    requirements: requirementField,
    budgetAllocated: z
        .number()
        .min(0)
        .optional()
        .refine(
            (v) => v === undefined || v === null || isPaiseExact(v),
            "amount cannot be finer than paise (2 decimal places)",
        ),
    budgetSpent: z
        .number()
        .min(0)
        .optional()
        .refine(
            (v) => v === undefined || v === null || isPaiseExact(v),
            "amount cannot be finer than paise (2 decimal places)",
        ),
    attendees: z.number().int().min(0).optional(),
    poster: z.string().trim().max(2000).optional().nullable(),
});

export const getAllEventsSchema = z.object({
    search: z.preprocess((val) => {
        if (typeof val !== "string") return undefined;
        const trimmed = val.trim();
        return trimmed === "" ? undefined : trimmed;
    }, z.string().optional()),
    type: z.preprocess(
        (val) => {
            if (typeof val === "string") {
                return val
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
            }
            return undefined;
        },
        z.array(z.enum(LX_EVENT_TYPES)).optional(),
    ),
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
        z.array(z.enum(LX_EVENT_STATUSES)).optional(),
    ),
    clubId: z.preprocess((val) => {
        if (typeof val !== "string") return undefined;
        const trimmed = val.trim();
        return trimmed === "" ? undefined : trimmed;
    }, z.string().optional()),
    clanId: z.preprocess((val) => {
        if (typeof val !== "string") return undefined;
        const trimmed = val.trim();
        return trimmed === "" ? undefined : trimmed;
    }, z.string().optional()),
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
    sortBy: z.enum(LX_EVENT_SORT_BY).optional().default("startDate"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const availabilitySchema = z.object({
    roomIds: z.array(z.string().trim().min(1)).min(1, "roomIds is required"),
    startDate: z.coerce.date({
        message: "startDate must be a valid date",
    }),
    endDate: z.coerce.date({
        message: "endDate must be a valid date",
    }),
    excludeEventId: z.string().trim().optional().nullable(),
});

export const approveEventSchema = z.object({
    action: z.enum(["approve", "reject"], {
        message: "action must be 'approve' or 'reject'",
    }),
    rejectionReason: z.string().trim().max(2000).optional().nullable(),
});
