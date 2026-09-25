import { Currency } from '@prisma/client';
import prisma from '../config/prisma';

export const getSummary = async (userId: string, year: number, month: number, currency: Currency) => {
  const rangeStart = new Date(year, month - 1, 1);
  const rangeEnd = new Date(year, month, 1);

  const [expenses, budgets] = await Promise.all([
    prisma.expense.findMany({
      where: { userId, currency, date: { gte: rangeStart, lt: rangeEnd } },
      include: { category: true },
    }),
    prisma.budget.findMany({
      where: { userId, year, month, currency },
      include: { category: true },
    }),
  ]);

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.limitAmount), 0);

  const byCategory = new Map<string, { categoryId: string; name: string; color: string; total: number }>();
  for (const expense of expenses) {
    const key = expense.categoryId;
    const entry = byCategory.get(key) ?? {
      categoryId: key,
      name: expense.category.name,
      color: expense.category.color,
      total: 0,
    };
    entry.total += Number(expense.amount);
    byCategory.set(key, entry);
  }

  return {
    year,
    month,
    currency,
    totalExpenses,
    totalBudget,
    remainingBudget: totalBudget - totalExpenses,
    expenseCount: expenses.length,
    categoryBreakdown: Array.from(byCategory.values()).sort((a, b) => b.total - a.total),
  };
};
