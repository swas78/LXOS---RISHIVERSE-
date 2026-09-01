import { z } from 'zod';

// Assign a role / linkage to a user. Identify by userId (existing) or email
// (create if absent). type drives the resulting role + linkage.
export const assignAccessSchema = z
  .object({
    userId: z.string().trim().optional(),
    email: z.string().trim().email().optional(),
    name: z.string().trim().max(200).optional(),
    type: z.enum(['admin', 'lx', 'finance', 'club', 'clan', 'guest']),
    clubId: z.string().trim().optional().nullable(),
    clanId: z.string().trim().optional().nullable(),
  })
  .refine((v) => v.userId || v.email, {
    message: 'Provide a userId or an email',
    path: ['email'],
  })
  .refine((v) => v.type !== 'club' || !!v.clubId, {
    message: 'clubId is required to assign a club',
    path: ['clubId'],
  })
  .refine((v) => v.type !== 'clan' || !!v.clanId, {
    message: 'clanId is required to assign a clan',
    path: ['clanId'],
  });

export const removeAccessSchema = z.object({
  userId: z.string().trim().min(1, 'userId is required'),
  type: z.enum(['admin', 'lx', 'finance', 'club', 'clan']),
});
