import { z } from 'zod';

export const currencySchema = z.enum(['USD', 'INR']);

export type CurrencyInput = z.infer<typeof currencySchema>;
