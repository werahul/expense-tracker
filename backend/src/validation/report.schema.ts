import { z } from 'zod';

export const reportQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12).optional(),
  format: z.enum(['csv', 'xlsx']).default('csv'),
});

export type ReportQuery = z.infer<typeof reportQuerySchema>;
