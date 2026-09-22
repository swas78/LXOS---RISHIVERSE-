import { z } from 'zod';
import {
  LX_INITIATIVE_STATUSES,
  LX_INITIATIVE_PRIORITIES,
  LX_INITIATIVE_SORT_BY,
} from '../../constants/lxInitiativeConstant.js';

const teamField = z.array(z.string().trim().min(1).max(120)).optional();

export const createInitiativeSchema = z.object({
  title: z.string().trim().min(1, 'title is required').max(200),
  description: z.string().trim().max(4000).optional(),
  clanId: z.string().trim().min(1, 'clanId is required'),
  clanName: z.string().trim().max(120).optional().nullable(),
  semester: z.string().trim().max(60).optional(),
  status: z
    .enum(LX_INITIATIVE_STATUSES, {
      message: `status must be one of: ${LX_INITIATIVE_STATUSES.join(', ')}`,
    })
    .optional(),
  progress: z.number().int().min(0).max(100).optional(),
  priority: z
    .enum(LX_INITIATIVE_PRIORITIES, {
      message: `priority must be one of: ${LX_INITIATIVE_PRIORITIES.join(', ')}`,
    })
    .optional(),
  team: teamField,
});

export const updateInitiativeSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(4000).optional(),
  clanId: z.string().trim().min(1).optional(),
  clanName: z.string().trim().max(120).optional().nullable(),
  semester: z.string().trim().max(60).optional(),
  status: z
    .enum(LX_INITIATIVE_STATUSES, {
      message: `status must be one of: ${LX_INITIATIVE_STATUSES.join(', ')}`,
    })
    .optional(),
  progress: z.number().int().min(0).max(100).optional(),
  priority: z
    .enum(LX_INITIATIVE_PRIORITIES, {
      message: `priority must be one of: ${LX_INITIATIVE_PRIORITIES.join(', ')}`,
    })
    .optional(),
  team: teamField,
});

export const getAllInitiativesSchema = z.object({
  search: z.preprocess((val) => {
    if (typeof val !== 'string') return undefined;
    const trimmed = val.trim();
    return trimmed === '' ? undefined : trimmed;
  }, z.string().optional()),
  clanId: z.preprocess((val) => {
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
  }, z.array(z.enum(LX_INITIATIVE_STATUSES)).optional()),
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
  sortBy: z.enum(LX_INITIATIVE_SORT_BY).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
