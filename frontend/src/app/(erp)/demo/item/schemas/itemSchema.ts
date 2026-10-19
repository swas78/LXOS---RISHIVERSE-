import { z } from "zod";

export const createItemSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(200),
    description: z.string().trim().max(2000).optional().nullable(),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
});

export type CreateItemFormValues = z.infer<typeof createItemSchema>;
