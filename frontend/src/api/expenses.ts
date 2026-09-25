import { apiClient } from './client';
import type { Currency, Expense, Paginated } from '../types';

export interface ExpenseFilters {
  categoryId?: string;
  currency?: Currency;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  pageSize?: number;
}

export const fetchExpenses = (filters: ExpenseFilters) =>
  apiClient.get<Paginated<Expense>>('/expenses', { params: filters }).then((res) => res.data);

export const createExpense = (data: {
  categoryId: string;
  amount: number;
  currency: Currency;
  description?: string;
  date: string;
}) => apiClient.post<Expense>('/expenses', data).then((res) => res.data);

export const updateExpense = (
  id: string,
  data: Partial<{ categoryId: string; amount: number; currency: Currency; description: string; date: string }>
) => apiClient.put<Expense>(`/expenses/${id}`, data).then((res) => res.data);

export const deleteExpense = (id: string) => apiClient.delete(`/expenses/${id}`);
