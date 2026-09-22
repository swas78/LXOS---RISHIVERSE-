import { z } from 'zod';

// Mirrors core's `POST /api/v1/upload/presigned-url` request body.
export const presignedUrlSchema = z.object({
  fileName: z.string().trim().min(1, 'fileName is required').max(255),
  contentType: z.string().trim().min(1, 'contentType is required').max(150),
  type: z.enum(['img', 'image', 'pdf', 'video', 'document']),
});

/**
 * One stored attachment. This is the canonical shape for `LxExpense.bills`,
 * `LxReimbursement.bills` and anything else that hangs a file off a row.
 *
 * `s3Path` is the ONLY durable field — a `s3:<bucket>:<key>` pointer. Never
 * accept or persist a public bucket URL: read URLs are signed at read time and
 * expire (lxos-core-pack/upload.md).
 */
export const attachmentSchema = z.object({
  s3Path: z
    .string()
    .trim()
    .min(1, 's3Path is required')
    .max(500)
    .regex(/^s3:[^:]+:.+$/, 's3Path must look like s3:<bucket>:<key>'),
  fileName: z.string().trim().min(1, 'fileName is required').max(300),
  contentType: z.string().trim().max(150).optional().default(''),
  size: z.number().int().nonnegative().optional().default(0),
  uploadedAt: z.coerce.date().optional(),
});

export default { presignedUrlSchema, attachmentSchema };
