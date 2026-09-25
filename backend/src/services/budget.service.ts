import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { CreateBudgetInput, ListBudgetQuery, UpdateBudgetInput } from '../validation/budget.schema';

export const listBudgets = async (userId: string, query: ListBudgetQuery) => {
  const where: Prisma.BudgetWhereInput = { userId };
  if (query.month) where.month = query.month;
  if (query.year) where.year = query.year;
  if (query.currency) where.currency = query.currency;

  const budgets = await prisma.budget.findMany({
    where,
    include: { category: true },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });

  const withSpent = await Promise.all(
    budgets.map(async (budget) => {
      const spentAgg = await prisma.expense.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          currency: budget.currency,
          date: {
            gte: new Date(budget.year, budget.month - 1, 1),
            lt: new Date(budget.year, budget.month, 1),
          },
        },
        _sum: { amount: true },
      });

      return {
        ...budget,
        spent: spentAgg._sum.amount ?? 0,
      };
    })
  );

  return withSpent;
};

export const createBudget = async (userId: string, input: CreateBudgetInput) => {
  const category = await prisma.category.findFirst({ where: { id: input.categoryId, userId } });
  if (!category) {
    throw ApiError.badRequest('Category does not exist or does not belong to you');
  }

  const existing = await prisma.budget.findUnique({
    where: {
      userId_categoryId_month_year_currency: {
        userId,
        categoryId: input.categoryId,
        month: input.month,
        year: input.year,
        currency: input.currency,
      },
    },
  });
  if (existing) {
    throw ApiError.conflict('A budget for this category, month, and currency already exists');
  }

  return prisma.budget.create({
    data: {
      userId,
      categoryId: input.categoryId,
      month: input.month,
      year: input.year,
      limitAmount: input.limitAmount,
      currency: input.currency,
    },
    include: { category: true },
  });
};

const getOwnedBudget = async (userId: string, id: string) => {
  const budget = await prisma.budget.findFirst({ where: { id, userId } });
  if (!budget) {
    throw ApiError.notFound('Budget not found');
  }
  return budget;
};

export const updateBudget = async (userId: string, id: string, input: UpdateBudgetInput) => {
  await getOwnedBudget(userId, id);
  return prisma.budget.update({
    where: { id },
    data: { limitAmount: input.limitAmount },
    include: { category: true },
  });
};

export const deleteBudget = async (userId: string, id: string) => {
  await getOwnedBudget(userId, id);
  await prisma.budget.delete({ where: { id } });
};
