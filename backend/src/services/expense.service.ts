import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { CreateExpenseInput, ListExpenseQuery, UpdateExpenseInput } from '../validation/expense.schema';

const ensureCategoryOwnership = async (userId: string, categoryId: string) => {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) {
    throw ApiError.badRequest('Category does not exist or does not belong to you');
  }
};

export const listExpenses = async (userId: string, query: ListExpenseQuery) => {
  const where: Prisma.ExpenseWhereInput = { userId };

  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.currency) where.currency = query.currency;

  if (query.startDate || query.endDate) {
    where.date = {
      ...(query.startDate ? { gte: query.startDate } : {}),
      ...(query.endDate ? { lte: query.endDate } : {}),
    };
  }

  if (query.minAmount !== undefined || query.maxAmount !== undefined) {
    where.amount = {
      ...(query.minAmount !== undefined ? { gte: query.minAmount } : {}),
      ...(query.maxAmount !== undefined ? { lte: query.maxAmount } : {}),
    };
  }

  const [items, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize) || 1,
    },
  };
};

export const createExpense = async (userId: string, input: CreateExpenseInput) => {
  await ensureCategoryOwnership(userId, input.categoryId);

  return prisma.expense.create({
    data: {
      userId,
      categoryId: input.categoryId,
      amount: input.amount,
      currency: input.currency,
      description: input.description,
      date: input.date,
    },
    include: { category: true },
  });
};

const getOwnedExpense = async (userId: string, id: string) => {
  const expense = await prisma.expense.findFirst({ where: { id, userId } });
  if (!expense) {
    throw ApiError.notFound('Expense not found');
  }
  return expense;
};

export const updateExpense = async (userId: string, id: string, input: UpdateExpenseInput) => {
  await getOwnedExpense(userId, id);

  if (input.categoryId) {
    await ensureCategoryOwnership(userId, input.categoryId);
  }

  return prisma.expense.update({
    where: { id },
    data: input,
    include: { category: true },
  });
};

export const deleteExpense = async (userId: string, id: string) => {
  await getOwnedExpense(userId, id);
  await prisma.expense.delete({ where: { id } });
};
