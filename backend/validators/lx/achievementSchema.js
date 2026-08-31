import { z } from 'zod';
import {
  LX_ACHIEVEMENT_CATEGORIES,
  LX_ACHIEVEMENT_KINDS,
  LX_ACHIEVEMENT_STATUSES,
  LX_ACHIEVEMENT_SORT_BY,
} from '../../constants/lxAchievementConstant.js';

const participantsField = z.array(z.string().trim().min(1).max(160)).optional();
const imagesField = z.array(z.string().trim().min(1).max(2048)).optional();

const categoryField = z
  .enum(LX_ACHIEVEMENT_CATEGORIES, {
    errorMap: () => ({
      message: `category must be one of: ${LX_ACHIEVEMENT_CATEGORIES.join(', ')}`,
    }),
  })
  .optional();

const kindField = z
  .enum(LX_ACHIEVEMENT_KINDS, {
    errorMap: () => ({ message: `kind must be one of: ${LX_ACHIEVEMENT_KINDS.join(', ')}` }),
  })
  .optional();

export const createAchievementSchema = z.object({
  title: z.string().trim().min(1, 'title is required').max(200),
  description: z.string().trim().min(1, 'description is required').max(5000),
  eventId: z.string().trim().max(120).optional().nullable(),
  clubId: z.string().trim().max(120).optional().nullable(),
  clubName: z.string().trim().max(200).optional().nullable(),
  clanId: z.string().trim().max(120).optional().nullable(),
  clanName: z.string().trim().max(200).optional().nullable(),
  points: z.number().int().min(0).max(1000000).optional(),
  achievedDate: z.coerce.date().optional(),
  semester: z.string().trim().max(120).optional(),
  category: categoryField,
  kind: kindField,
  participants: participantsField,
  images: imagesField,
});

export const updateAchievementSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1).max(5000).optional(),
  eventId: z.string().trim().max(120).optional().nullable(),
  clubId: z.string().trim().max(120).optional().nullable(),
  clubName: z.string().trim().max(200).optional().nullable(),
  clanId: z.string().trim().max(120).optional().nullable(),
  clanName: z.string().trim().max(200).optional().nullable(),
  points: z.number().int().min(0).max(1000000).optional(),
  achievedDate: z.coerce.date().optional(),
  semester: z.string().trim().max(120).optional(),
  category: categoryField,
  kind: kindField,
  participants: participantsField,
  images: imagesField,
});

const csvEnum = (values) =>
  z.preprocess((val) => {
    if (typeof val === 'string') {
      return val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return undefined;
  }, z.array(z.enum(values)).optional());

export const getAllAchievementsSchema = z.object({
  search: z.preprocess((val) => {
    if (typeof val !== 'string') return undefined;
    const trimmed = val.trim();
    return trimmed === '' ? undefined : trimmed;
  }, z.string().optional()),
  person: z.preprocess((val) => {
    if (typeof val !== 'string') return undefined;
    const trimmed = val.trim();
    return trimmed === '' ? undefined : trimmed;
  }, z.string().optional()),
  clubId: z.preprocess((val) => {
    if (typeof val !== 'string') return undefined;
    const trimmed = val.trim();
    return trimmed === '' ? undefined : trimmed;
  }, z.string().optional()),
  clanId: z.preprocess((val) => {
    if (typeof val !== 'string') return undefined;
    const trimmed = val.trim();
    return trimmed === '' ? undefined : trimmed;
  }, z.string().optional()),
  kind: kindField,
  category: csvEnum(LX_ACHIEVEMENT_CATEGORIES),
  status: csvEnum(LX_ACHIEVEMENT_STATUSES),
  page: z.preprocess((val) => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }, z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }, z.number().int().min(1).max(100).default(12)),
  sortBy: z.enum(LX_ACHIEVEMENT_SORT_BY).optional().default('achievedDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const reviewAchievementSchema = z.object({
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: "action must be 'approve' or 'reject'" }),
  }),
  rejectionReason: z.string().trim().max(2000).optional().nullable(),
});
