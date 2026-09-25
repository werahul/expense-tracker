import { z } from 'zod';
import { currencySchema } from './currency.schema';

export const createBudgetSchema = z.object({
  categoryId: z.string().uuid(),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  limitAmount: z.coerce.number().positive(),
  currency: currencySchema.default('USD'),
});

export const updateBudgetSchema = z.object({
  limitAmount: z.coerce.number().positive(),
});

export const listBudgetQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  currency: currencySchema.optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type ListBudgetQuery = z.infer<typeof listBudgetQuerySchema>;
