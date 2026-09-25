import { apiClient } from './client';
import type { Currency, DashboardSummary } from '../types';

export const fetchDashboardSummary = (year: number, month: number, currency: Currency) =>
  apiClient
    .get<DashboardSummary>('/dashboard/summary', { params: { year, month, currency } })
    .then((res) => res.data);
