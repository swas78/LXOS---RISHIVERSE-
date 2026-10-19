import { z } from "zod";

export const FILE_TYPES = ["BILL", "REPORT", "POSTER", "DOCUMENT", "OTHER"] as const;

export const uploadFileSchema = z.object({
    originalName: z.string().trim().min(1, "File name is required").max(255),
    type: z.enum(FILE_TYPES),
    tags: z.string().trim().max(500).optional(),
    path: z.string().trim().max(2000).optional(),
    size: z
        .string()
        .trim()
        .optional()
        .refine((v) => !v || /^\d+$/.test(v), "Size must be a whole number of bytes"),
    eventId: z.string().trim().max(120).optional(),
    clubId: z.string().trim().max(120).optional(),
    description: z.string().trim().max(2000).optional(),
});

export type UploadFileValues = z.infer<typeof uploadFileSchema>;
