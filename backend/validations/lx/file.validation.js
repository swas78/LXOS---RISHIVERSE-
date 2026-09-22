import { z } from "zod";
import { LX_FILE_TYPES, LX_FILE_SORT_BY } from "../../constants/lxFileConstant.js";

const tagsField = z.array(z.string().trim().min(1).max(60)).optional();

export const createFileSchema = z.object({
    // Core S3 pointer returned by the presign step. Never a public bucket URL.
    fileKey: z
        .string()
        .trim()
        .min(1, "fileKey is required")
        .max(500)
        .regex(/^s3:[^:]+:.+$/, "fileKey must look like s3:<bucket>:<key>"),
    originalName: z.string().trim().min(1, "originalName is required").max(255),
    // Required: both columns are non-null and both come back from the upload step.
    mimeType: z.string().trim().min(1, "mimeType is required").max(255),
    size: z.number().int().min(0).max(1000000000000),
    type: z
        .enum(LX_FILE_TYPES, {
            message: `type must be one of: ${LX_FILE_TYPES.join(", ")}`,
        })
        .optional(),
    tags: tagsField,
    eventId: z.string().trim().max(120).optional().nullable(),
    clubId: z.string().trim().max(120).optional().nullable(),
    semester: z.string().trim().max(120).optional(),
    description: z.string().trim().max(2000).optional().nullable(),
});

export const updateFileSchema = z.object({
    originalName: z.string().trim().min(1).max(255).optional(),
    type: z
        .enum(LX_FILE_TYPES, {
            message: `type must be one of: ${LX_FILE_TYPES.join(", ")}`,
        })
        .optional(),
    tags: tagsField,
    eventId: z.string().trim().max(120).optional().nullable(),
    clubId: z.string().trim().max(120).optional().nullable(),
    semester: z.string().trim().max(120).optional(),
    description: z.string().trim().max(2000).optional().nullable(),
});

export const getAllFilesSchema = z.object({
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
        z.array(z.enum(LX_FILE_TYPES)).optional(),
    ),
    tag: z.preprocess((val) => {
        if (typeof val !== "string") return undefined;
        const trimmed = val.trim();
        return trimmed === "" ? undefined : trimmed;
    }, z.string().optional()),
    eventId: z.preprocess((val) => {
        if (typeof val !== "string") return undefined;
        const trimmed = val.trim();
        return trimmed === "" ? undefined : trimmed;
    }, z.string().optional()),
    clubId: z.preprocess((val) => {
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
    sortBy: z.enum(LX_FILE_SORT_BY).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
