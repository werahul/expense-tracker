jest.mock('../src/config/prisma', () => ({
  __esModule: true,
  default: {
    category: {
      findFirst: jest.fn(),
    },
    budget: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import prisma from '../src/config/prisma';
import * as budgetService from '../src/services/budget.service';
import { ApiError } from '../src/utils/apiError';

const mockedPrisma = prisma as unknown as {
  category: { findFirst: jest.Mock };
  budget: { findUnique: jest.Mock; create: jest.Mock };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('budget.service.createBudget', () => {
  it('rejects a duplicate budget for the same category and month', async () => {
    mockedPrisma.category.findFirst.mockResolvedValue({ id: 'cat-1', userId: 'user-1' });
    mockedPrisma.budget.findUnique.mockResolvedValue({ id: 'existing-budget' });

    await expect(
      budgetService.createBudget('user-1', {
        categoryId: 'cat-1',
        month: 5,
        year: 2026,
        limitAmount: 200,
        currency: 'USD',
      })
    ).rejects.toBeInstanceOf(ApiError);

    expect(mockedPrisma.budget.create).not.toHaveBeenCalled();
  });

  it('creates the budget when none exists yet for that category and month', async () => {
    mockedPrisma.category.findFirst.mockResolvedValue({ id: 'cat-1', userId: 'user-1' });
    mockedPrisma.budget.findUnique.mockResolvedValue(null);
    mockedPrisma.budget.create.mockResolvedValue({ id: 'budget-1' });

    const result = await budgetService.createBudget('user-1', {
      categoryId: 'cat-1',
      month: 5,
      year: 2026,
      limitAmount: 200,
      currency: 'USD',
    });

    expect(result).toEqual({ id: 'budget-1' });
  });
});
