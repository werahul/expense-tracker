export type Currency = 'USD' | 'INR';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Expense {
  id: string;
  categoryId: string;
  category: Category;
  amount: string;
  currency: Currency;
  description: string | null;
  date: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  category: Category;
  month: number;
  year: number;
  limitAmount: string;
  currency: Currency;
  spent: string | number;
}

export interface Paginated<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardSummary {
  year: number;
  month: number;
  currency: Currency;
  totalExpenses: number;
  totalBudget: number;
  remainingBudget: number;
  expenseCount: number;
  categoryBreakdown: { categoryId: string; name: string; color: string; total: number }[];
}

export interface MonthlyReport {
  year: number;
  month: number;
  currency: Currency;
  total: number;
  byDay: { day: number; total: number }[];
  byCategory: { category: string; total: number }[];
}

export interface YearlyReport {
  year: number;
  currency: Currency;
  total: number;
  byMonth: { month: number; total: number }[];
  byCategory: { category: string; total: number }[];
}
