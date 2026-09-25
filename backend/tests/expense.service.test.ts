jest.mock('../src/config/prisma', () => ({
  __esModule: true,
  default: {
    category: {
      findFirst: jest.fn(),
    },
    expense: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import prisma from '../src/config/prisma';
import * as expenseService from '../src/services/expense.service';
import { ApiError } from '../src/utils/apiError';

const mockedPrisma = prisma as unknown as {
  category: { findFirst: jest.Mock };
  expense: {
    findMany: jest.Mock;
    count: jest.Mock;
    create: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('expense.service.createExpense', () => {
  it('rejects a category that does not belong to the user', async () => {
    mockedPrisma.category.findFirst.mockResolvedValue(null);

    await expect(
      expenseService.createExpense('user-1', {
        categoryId: 'cat-1',
        amount: 20,
        currency: 'USD',
        date: new Date(),
      })
    ).rejects.toBeInstanceOf(ApiError);

    expect(mockedPrisma.expense.create).not.toHaveBeenCalled();
  });

  it('creates the expense once the category is confirmed owned by the user', async () => {
    mockedPrisma.category.findFirst.mockResolvedValue({ id: 'cat-1', userId: 'user-1' });
    mockedPrisma.expense.create.mockResolvedValue({ id: 'exp-1', amount: 20 });

    const result = await expenseService.createExpense('user-1', {
      categoryId: 'cat-1',
      amount: 20,
      currency: 'USD',
      date: new Date(),
    });

    expect(result).toEqual({ id: 'exp-1', amount: 20 });
    expect(mockedPrisma.expense.create).toHaveBeenCalledTimes(1);
  });
});

describe('expense.service.deleteExpense', () => {
  it('rejects deleting an expense that does not belong to the user', async () => {
    mockedPrisma.expense.findFirst.mockResolvedValue(null);

    await expect(expenseService.deleteExpense('user-1', 'exp-1')).rejects.toBeInstanceOf(ApiError);
    expect(mockedPrisma.expense.delete).not.toHaveBeenCalled();
  });

  it('deletes the expense when it belongs to the user', async () => {
    mockedPrisma.expense.findFirst.mockResolvedValue({ id: 'exp-1', userId: 'user-1' });
    mockedPrisma.expense.delete.mockResolvedValue({});

    await expenseService.deleteExpense('user-1', 'exp-1');

    expect(mockedPrisma.expense.delete).toHaveBeenCalledWith({ where: { id: 'exp-1' } });
  });
});
