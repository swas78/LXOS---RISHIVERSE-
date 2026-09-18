import { z } from 'zod';
import {
  LX_LOST_FOUND_CATEGORIES,
  LX_LOST_FOUND_KINDS,
  LX_LOST_FOUND_SORT_BY,
  LX_LOST_FOUND_STATUSES,
} from '../../constants/lxLostFoundConstant.js';

// Same normalisation as the cabin form: accept what people type, store digits.
const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/\D/g, '').slice(-10))
  .refine((v) => /^[6-9]\d{9}$/.test(v), 'Enter a valid 10-digit Indian mobile number');

export const createLostFoundSchema = z.object({
  kind: z.enum(LX_LOST_FOUND_KINDS),
  title: z.string().trim().min(3, 'Give the item a short name').max(140),
  description: z.string().trim().min(10, 'Describe the item so its owner can recognise it').max(2000),
  category: z.enum(LX_LOST_FOUND_CATEGORIES).optional().default('OTHER'),
  // A photo is how anyone actually recognises their property, so at least one
  // is required rather than merely encouraged.
  images: z
    .array(z.string().trim().min(1))
    .min(1, 'Add at least one photo of the item')
    .max(6),
  location: z.string().trim().min(3, 'Say where it was lost or found').max(200),
  occurredOn: z.coerce.date({ errorMap: () => ({ message: 'When did this happen?' }) }),
  contactPhone: phone.optional().nullable(),
});

export const updateLostFoundSchema = z.object({
  title: z.string().trim().min(3).max(140).optional(),
  description: z.string().trim().min(10).max(2000).optional(),
  category: z.enum(LX_LOST_FOUND_CATEGORIES).optional(),
  images: z.array(z.string().trim().min(1)).min(1).max(6).optional(),
  location: z.string().trim().min(3).max(200).optional(),
  occurredOn: z.coerce.date().optional(),
  contactPhone: phone.optional().nullable(),
});

export const reviewLostFoundSchema = z.object({
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().trim().max(500).optional().nullable(),
});

export const resolveLostFoundSchema = z.object({
  resolutionNote: z.string().trim().max(500).optional().nullable(),
});

export const getAllLostFoundSchema = z.object({
  search: z.string().trim().optional(),
  kind: z.enum(LX_LOST_FOUND_KINDS).optional(),
  category: z.enum(LX_LOST_FOUND_CATEGORIES).optional(),
  status: z.enum(LX_LOST_FOUND_STATUSES).optional(),
  /// BOARD = the public noticeboard, PENDING = the review queue, MINE = my reports.
  scope: z.enum(['BOARD', 'PENDING', 'MINE', 'RESOLVED']).optional().default('BOARD'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
  sortBy: z.enum(LX_LOST_FOUND_SORT_BY).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
