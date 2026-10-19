import { z } from "zod";

export const EVENT_TYPES = ["CLUB", "CLAN", "LX", "FEST"] as const;

export const requirementSchema = z.object({
    item: z.string().trim().min(1, "Item is required"),
    quantity: z.number().int().min(0).optional(),
    estimatedCost: z.number().min(0).optional(),
});

export const createEventFormSchema = z
    .object({
        title: z.string().trim().min(1, "Title is required").max(200),
        description: z.string().trim().min(1, "Description is required").max(5000),
        type: z.enum(EVENT_TYPES),
        clubId: z.string().trim().optional(),
        clanId: z.string().trim().optional(),
        startDate: z.string().min(1, "Start date is required"),
        endDate: z.string().min(1, "End date is required"),
        roomIds: z.array(z.string()).optional(),
        location: z.string().trim().max(300).optional(),
        budgetAllocated: z.number().min(0).optional(),
        attendees: z.number().int().min(0).optional(),
        requirements: z.array(requirementSchema).optional(),
    })
    .refine((v) => new Date(v.endDate) >= new Date(v.startDate), {
        message: "End date must be on or after start date",
        path: ["endDate"],
    })
    .refine((v) => v.type !== "CLUB" || !!v.clubId, {
        message: "Select a club for a CLUB event",
        path: ["clubId"],
    })
    .refine((v) => v.type !== "CLAN" || !!v.clanId, {
        message: "Select a clan for a CLAN event",
        path: ["clanId"],
    });

export type CreateEventFormValues = z.infer<typeof createEventFormSchema>;
