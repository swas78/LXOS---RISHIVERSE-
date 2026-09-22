import { z } from 'zod';
import {
  LX_CLUB_CATEGORIES,
  LX_CLUB_SORT_BY,
} from '../../constants/lxClubConstant.js';

const categoryField = z.enum(LX_CLUB_CATEGORIES, {
  errorMap: () => ({
    message: `category must be one of: ${LX_CLUB_CATEGORIES.join(', ')}`,
  }),
});

export const createClubSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(120),
  description: z.string().trim().min(1, 'description is required').max(2000),
  logo: z.string().trim().max(500).optional().nullable(),
  category: categoryField.optional(),
  budgetAllocated: z.number().min(0).optional(),
  budgetSpent: z.number().min(0).optional(),
  semester: z.string().trim().max(60).optional(),
  headName: z.string().trim().max(120).optional().nullable(),
  headEmail: z.string().trim().max(160).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateClubSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().min(1).max(2000).optional(),
  logo: z.string().trim().max(500).optional().nullable(),
  category: categoryField.optional(),
  budgetAllocated: z.number().min(0).optional(),
  budgetSpent: z.number().min(0).optional(),
  semester: z.string().trim().max(60).optional(),
  headName: z.string().trim().max(120).optional().nullable(),
  headEmail: z.string().trim().max(160).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const getAllClubsSchema = z.object({
  search: z.preprocess((val) => {
    if (typeof val !== 'string') return undefined;
    const trimmed = val.trim();
    return trimmed === '' ? undefined : trimmed;
  }, z.string().optional()),
  category: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return undefined;
  }, z.array(z.enum(LX_CLUB_CATEGORIES)).optional()),
  isActive: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    if (typeof val === 'string') return val.toLowerCase() === 'true';
    return val;
  }, z.boolean().optional()),
  page: z.preprocess((val) => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }, z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }, z.number().int().min(1).max(100).default(10)),
  sortBy: z.enum(LX_CLUB_SORT_BY).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});
