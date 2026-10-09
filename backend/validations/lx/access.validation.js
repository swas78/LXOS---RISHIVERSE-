import { z } from "zod";

// Assign a role / linkage to a member.
//
// Identify by `memberId` (an existing LxMember row) or by `referenceId` — core
// `User.referenceId`, i.e. a student's enrollmentNo or an employee's
// employeeId. referenceId is the canonical identifier: in production an admin
// picks a person out of the core directory and we get their referenceId back.
//
// `email` is a DEV-ONLY convenience so the kit can address the seeded stubs by
// address. Drop it at handoff — core owns email.
export const assignAccessSchema = z
    .object({
        memberId: z.string().trim().optional(),
        referenceId: z.string().trim().max(64).optional(),
        email: z.string().trim().email().optional(),
        displayName: z.string().trim().max(200).optional(),
        type: z.enum(["admin", "lx", "finance", "librarian", "club", "clan", "guest"]),
        clubId: z.string().trim().optional().nullable(),
        clanId: z.string().trim().optional().nullable(),
    })
    .refine((v) => v.memberId || v.referenceId || v.email, {
        message: "Provide a memberId, a referenceId (enrollment/employee id), or an email",
        path: ["referenceId"],
    })
    .refine((v) => v.type !== "club" || !!v.clubId, {
        message: "clubId is required to assign a club",
        path: ["clubId"],
    })
    .refine((v) => v.type !== "clan" || !!v.clanId, {
        message: "clanId is required to assign a clan",
        path: ["clanId"],
    });

export const removeAccessSchema = z.object({
    memberId: z.string().trim().min(1, "memberId is required"),
    type: z.enum(["admin", "lx", "finance", "librarian", "club", "clan"]),
});
