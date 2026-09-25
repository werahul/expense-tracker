jest.mock('../src/config/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    category: {
      createMany: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

import bcrypt from 'bcrypt';
import prisma from '../src/config/prisma';
import * as authService from '../src/services/auth.service';
import { ApiError } from '../src/utils/apiError';

const mockedPrisma = prisma as unknown as {
  user: { findUnique: jest.Mock; create: jest.Mock };
  category: { createMany: jest.Mock };
  refreshToken: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock; updateMany: jest.Mock };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('auth.service.register', () => {
  it('rejects registration when the email is already taken', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

    await expect(
      authService.register({ name: 'Jane', email: 'jane@example.com', password: 'password123' })
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('creates a user with a hashed password and returns a token pair', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);
    mockedPrisma.user.create.mockResolvedValue({
      id: 'user-1',
      name: 'Jane',
      email: 'jane@example.com',
      passwordHash: 'hashed',
    });
    mockedPrisma.category.createMany.mockResolvedValue({ count: 6 });
    mockedPrisma.refreshToken.create.mockResolvedValue({});

    const result = await authService.register({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(mockedPrisma.user.create).toHaveBeenCalledTimes(1);
    const createArgs = mockedPrisma.user.create.mock.calls[0][0];
    expect(createArgs.data.passwordHash).not.toBe('password123');
    expect(mockedPrisma.category.createMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.arrayContaining([expect.objectContaining({ userId: 'user-1' })]) })
    );

    expect(result.user).toEqual({ id: 'user-1', name: 'Jane', email: 'jane@example.com' });
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
  });
});

describe('auth.service.login', () => {
  it('rejects an unknown email', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);

    await expect(
      authService.login({ email: 'nobody@example.com', password: 'whatever' })
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('rejects an incorrect password', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 12);
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'Jane',
      email: 'jane@example.com',
      passwordHash,
    });

    await expect(
      authService.login({ email: 'jane@example.com', password: 'wrong-password' })
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('logs in successfully with the correct password', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 12);
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'Jane',
      email: 'jane@example.com',
      passwordHash,
    });
    mockedPrisma.refreshToken.create.mockResolvedValue({});

    const result = await authService.login({ email: 'jane@example.com', password: 'correct-password' });

    expect(result.user.email).toBe('jane@example.com');
    expect(result.accessToken).toBeTruthy();
  });
});
