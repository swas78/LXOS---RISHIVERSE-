import { z } from 'zod';

export const actOnApprovalSchema = z.object({
  type: z.enum(['EVENT', 'ACHIEVEMENT', 'REIMBURSEMENT', 'EXPENSE', 'PRODUCT', 'BOOKING', 'LOST_FOUND']),
  id: z.string().min(1, 'id is required'),
  action: z.enum(['approve', 'reject', 'process']),
  rejectionReason: z.string().trim().max(1000).optional().nullable(),
});
