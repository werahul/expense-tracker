import { apiClient } from './client';
import type { Currency, MonthlyReport, YearlyReport } from '../types';

export const fetchMonthlyReport = (year: number, month: number, currency: Currency) =>
  apiClient
    .get<MonthlyReport>('/reports/monthly', { params: { year, month, currency } })
    .then((res) => res.data);

export const fetchYearlyReport = (year: number, currency: Currency) =>
  apiClient.get<YearlyReport>('/reports/yearly', { params: { year, currency } }).then((res) => res.data);

export const downloadReport = async (
  year: number,
  month: number | undefined,
  format: 'csv' | 'xlsx',
  currency: Currency
) => {
  const res = await apiClient.get('/reports/export', {
    params: { year, month, format, currency },
    responseType: 'blob',
  });

  const url = URL.createObjectURL(res.data as Blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `expenses-${year}${month ? `-${String(month).padStart(2, '0')}` : ''}-${currency}.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
