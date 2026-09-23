import { z } from "zod";
import { isPaiseExact } from "../../helper/lxMoney.js";
import { LX_CLAN_SORT_BY } from "../../constants/lxClanConstant.js";

export const createClanSchema = z.object({
    name: z.string().trim().min(1, "name is required").max(120),
    color: z.string().trim().min(1, "color is required").max(40),
    points: z.number().int().min(0).max(10000000).optional(),
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
    semester: z.string().trim().max(60).optional(),
    description: z.string().trim().max(2000).optional(),
});

export const updateClanSchema = z.object({
    name: z.string().trim().min(1).max(120).optional(),
    color: z.string().trim().min(1).max(40).optional(),
    points: z.number().int().min(0).max(10000000).optional(),
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
    semester: z.string().trim().max(60).optional(),
    description: z.string().trim().max(2000).optional(),
});

export const getAllClansSchema = z.object({
    search: z.preprocess((val) => {
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
    sortBy: z.enum(LX_CLAN_SORT_BY).optional().default("points"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const manageClanPointsSchema = z.object({
    delta: z
        .number({ invalid_type_error: "delta must be a number" })
        .int("delta must be an integer"),
    reason: z.string().trim().min(1, "reason is required").max(500),
});
