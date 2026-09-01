import { z } from 'zod';
import {
  LX_REIMBURSEMENT_CATEGORIES,
  LX_REIMBURSEMENT_STATUSES,
  LX_REIMBURSEMENT_SORT_BY,
} from '../../constants/lxReimbursementConstant.js';

const billItemSchema = z.object({
  originalName: z.string().trim().min(1, 'originalName is required').max(300),
  path: z.string().trim().min(1, 'path is required').max(500),
  mimeType: z.string().trim().max(150).optional().default(''),
  size: z.number().int().min(0).optional().default(0),
});

const billsField = z.array(billItemSchema).optional();

// Where the payout should be sent — collected at submission time.
const bankDetailsSchema = z
  .object({
    accountHolderName: z.string().trim().max(200).optional().default(''),
    accountNumber: z.string().trim().max(60).optional().default(''),
    ifsc: z.string().trim().max(20).optional().default(''),
  })
  .optional();

const categoryField = z.enum(LX_REIMBURSEMENT_CATEGORIES, {
  errorMap: () => ({
    message: `category must be one of: ${LX_REIMBURSEMENT_CATEGORIES.join(', ')}`,
  }),
});

export const createReimbursementSchema = z.object({
  title: z.string().trim().min(1, 'title is required').max(200),
  description: z.string().trim().max(2000).optional(),
  amount: z.number().min(1, 'amount must be at least 1'),
  expenseDate: z.coerce.date({ errorMap: () => ({ message: 'expenseDate is required' }) }),
  category: categoryField,
  eventId: z.string().trim().optional().nullable(),
  eventTitle: z.string().trim().max(200).optional().nullable(),
  purpose: z.string().trim().max(2000).optional(),
  clubId: z.string().trim().optional().nullable(),
  clubName: z.string().trim().max(200).optional().nullable(),
  clanId: z.string().trim().optional().nullable(),
  clanName: z.string().trim().max(200).optional().nullable(),
  bankDetails: bankDetailsSchema,
  bills: billsField,
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const updateReimbursementSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  amount: z.number().min(1).optional(),
  expenseDate: z.coerce.date().optional(),
  category: categoryField.optional(),
  eventId: z.string().trim().optional().nullable(),
  eventTitle: z.string().trim().max(200).optional().nullable(),
  purpose: z.string().trim().max(2000).optional(),
  clubId: z.string().trim().optional().nullable(),
  clubName: z.string().trim().max(200).optional().nullable(),
  clanId: z.string().trim().optional().nullable(),
  clanName: z.string().trim().max(200).optional().nullable(),
  bills: billsField,
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const getAllReimbursementsSchema = z.object({
  search: z.preprocess((val) => {
    if (typeof val !== 'string') return undefined;
    const trimmed = val.trim();
    return trimmed === '' ? undefined : trimmed;
  }, z.string().optional()),
  status: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return undefined;
  }, z.array(z.enum(LX_REIMBURSEMENT_STATUSES)).optional()),
  category: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return undefined;
  }, z.array(z.enum(LX_REIMBURSEMENT_CATEGORIES)).optional()),
  submittedById: z.preprocess((val) => {
    if (typeof val !== 'string') return undefined;
    const trimmed = val.trim();
    return trimmed === '' ? undefined : trimmed;
  }, z.string().optional()),
  page: z.preprocess((val) => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }, z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }, z.number().int().min(1).max(200).default(50)),
  sortBy: z.enum(LX_REIMBURSEMENT_SORT_BY).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const reviewReimbursementSchema = z.object({
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: "action must be 'approve' or 'reject'" }),
  }),
  rejectionReason: z.string().trim().max(2000).optional().nullable(),
});

// Finance settles the payout externally and records only a reference to it
// (never raw bank details).
export const processReimbursementSchema = z.object({
  payoutRef: z.string().trim().max(200).optional().nullable(),
});
