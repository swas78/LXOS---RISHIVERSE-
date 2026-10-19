import { z } from "zod";

export const CLUB_CATEGORIES = [
    "TECHNICAL",
    "CULTURAL",
    "SPORTS",
    "SOCIAL",
    "ACADEMIC",
    "OTHER",
] as const;

export const createClubSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(120),
    description: z.string().trim().min(1, "Description is required").max(2000),
    category: z.enum(CLUB_CATEGORIES).optional(),
    budgetAllocated: z.number().min(0, "Must be 0 or more").optional(),
    headName: z.string().trim().max(120).optional().nullable(),
    headEmail: z.string().trim().email("Enter a valid email").max(160).optional().or(z.literal("")),
});

export type CreateClubFormValues = z.infer<typeof createClubSchema>;
