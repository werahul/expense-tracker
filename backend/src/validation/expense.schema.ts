import { z } from 'zod';
import { currencySchema } from './currency.schema';

export const createExpenseSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  currency: currencySchema.default('USD'),
  description: z.string().trim().max(255).optional(),
  date: z.coerce.date(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const listExpenseQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  currency: currencySchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minAmount: z.coerce.number().nonnegative().optional(),
  maxAmount: z.coerce.number().nonnegative().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ListExpenseQuery = z.infer<typeof listExpenseQuerySchema>;
