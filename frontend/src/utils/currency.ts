import type { Currency } from '../types';

export const CURRENCIES: Currency[] = ['USD', 'INR'];

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  USD: '$',
  INR: '₹',
};

const LOCALE: Record<Currency, string> = {
  USD: 'en-US',
  INR: 'en-IN',
};

export function formatMoney(value: string | number, currency: Currency): string {
  return new Intl.NumberFormat(LOCALE[currency], {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value));
}
