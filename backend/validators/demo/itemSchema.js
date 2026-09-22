import { z } from "zod";
import { DEMO_ITEM_SORT_BY, DEMO_ITEM_STATUSES } from "../../constants/demoConstant.js";

export const createItemSchema = z.object({
    title: z.string().trim().min(1, "title is required").max(200),
    description: z.string().trim().max(2000).optional().nullable(),
    status: z
        .enum(DEMO_ITEM_STATUSES, {
            errorMap: () => ({
                message: `status must be one of: ${DEMO_ITEM_STATUSES.join(", ")}`,
            }),
        })
        .optional(),
});

export const updateItemSchema = z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).optional().nullable(),
    status: z
        .enum(DEMO_ITEM_STATUSES, {
            errorMap: () => ({
                message: `status must be one of: ${DEMO_ITEM_STATUSES.join(", ")}`,
            }),
        })
        .optional(),
});

export const getAllItemsSchema = z.object({
    search: z.preprocess((val) => {
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
        z.array(z.enum(DEMO_ITEM_STATUSES)).optional(),
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
    sortBy: z.enum(DEMO_ITEM_SORT_BY).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
