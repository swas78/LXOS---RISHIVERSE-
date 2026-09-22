import { z } from "zod";

export const rolloverSchema = z.object({
    newSemester: z.string().trim().min(1, "newSemester is required").max(60),
    resetAllocation: z.boolean().optional().default(false),
});
