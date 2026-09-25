import { apiClient } from './client';
import type { Budget, Currency } from '../types';

export const fetchBudgets = (filters: { month?: number; year?: number; currency?: Currency }) =>
  apiClient.get<Budget[]>('/budgets', { params: filters }).then((res) => res.data);

export const createBudget = (data: {
  categoryId: string;
  month: number;
  year: number;
  limitAmount: number;
  currency: Currency;
}) => apiClient.post<Budget>('/budgets', data).then((res) => res.data);

export const updateBudget = (id: string, data: { limitAmount: number }) =>
  apiClient.put<Budget>(`/budgets/${id}`, data).then((res) => res.data);

export const deleteBudget = (id: string) => apiClient.delete(`/budgets/${id}`);
