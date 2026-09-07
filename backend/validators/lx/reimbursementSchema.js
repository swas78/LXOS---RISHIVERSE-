import { z } from 'zod';
import {
  COLLECT_BANK_DETAILS,
  LX_REIMBURSEMENT_CATEGORIES,
  LX_REIMBURSEMENT_MAX_BILLS,
  LX_REIMBURSEMENT_STATUSES,
  LX_REIMBURSEMENT_SORT_BY,
} from '../../constants/lxReimbursementConstant.js';
import { attachmentSchema } from './uploadSchema.js';

// Bills are plain attachment pointers — the canonical shape shared with
// LxExpense.bills and produced by the frontend uploader.
const AT_LEAST_ONE_BILL =
  'Attach at least one bill or receipt — a claim without one cannot be reviewed';

const billsArray = (params) =>
  z
    .array(attachmentSchema, params)
    .max(LX_REIMBURSEMENT_MAX_BILLS, `At most ${LX_REIMBURSEMENT_MAX_BILLS} bills can be attached`);

// Required on create: an approver cannot review a claim with no receipt. The
// required_error matters as much as min(1) — omitting the key and sending an
// empty array are the same mistake and deserve the same message.
const createBillsField = billsArray({ required_error: AT_LEAST_ONE_BILL }).min(
  1,
  AT_LEAST_ONE_BILL,
);

const updateBillsField = billsArray().optional();

// ⚠️ D3 VIOLATION, FLAG-GATED. See COLLECT_BANK_DETAILS. When the flag is off
// the key is simply absent from the shape, so zod's default strip drops any
// `bankDetails` a stale client still sends — it never reaches the service.
const bankDetailsSchema = z.object({
  accountHolderName: z.string().trim().min(1, 'accountHolderName is required').max(200),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{9,18}$/, 'accountNumber must be 9-18 digits'),
  ifsc: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim().toUpperCase() : val),
    z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'ifsc must look like HDFC0001234'),
  ),
});

const bankDetailsShape = COLLECT_BANK_DETAILS ? { bankDetails: bankDetailsSchema.optional() } : {};

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
  ...bankDetailsShape,
  bills: createBillsField,
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
  bills: updateBillsField,
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
  submittedByRef: z.preprocess((val) => {
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

// Finance settles the payout externally and records only the bank/UPI txn
// reference for it (never raw bank details). `payoutRef` — who to pay — is
// derived at submit time and is not client-writable here.
export const processReimbursementSchema = z.object({
  payoutTxnRef: z.string().trim().max(200).optional().nullable(),
});
