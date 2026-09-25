import bcrypt from 'bcrypt';
import prisma from '../config/prisma';
import { ApiError } from '../utils/apiError';
import {
  hashToken,
  refreshExpiryDate,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { LoginInput, RegisterInput } from '../validation/auth.schema';

const SALT_ROUNDS = 12;

const DEFAULT_CATEGORIES = [
  { name: 'Groceries', color: '#22c55e' },
  { name: 'Rent', color: '#6366f1' },
  { name: 'Transport', color: '#f59e0b' },
  { name: 'Entertainment', color: '#ec4899' },
  { name: 'Utilities', color: '#0ea5e9' },
  { name: 'Other', color: '#64748b' },
];

const buildTokenPair = async (userId: string, email: string) => {
  const accessToken = signAccessToken({ userId, email });
  const { token: refreshToken, jti } = signRefreshToken(userId);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(jti),
      expiresAt: refreshExpiryDate(),
    },
  });

  return { accessToken, refreshToken };
};

export const register = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
  });

  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((category) => ({ ...category, userId: user.id })),
  });

  const tokens = await buildTokenPair(user.id, user.email);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    ...tokens,
  };
};

export const login = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const tokens = await buildTokenPair(user.id, user.email);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    ...tokens,
  };
};

export const refresh = async (token: string) => {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Refresh token is invalid or expired');
  }

  const tokenHash = hashToken(payload.jti);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized('Refresh token has been revoked or expired');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    throw ApiError.unauthorized('User no longer exists');
  }

  await prisma.refreshToken.update({
    where: { tokenHash },
    data: { revokedAt: new Date() },
  });

  const tokens = await buildTokenPair(user.id, user.email);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    ...tokens,
  };
};

export const logout = async (token: string) => {
  try {
    const payload = verifyRefreshToken(token);
    const tokenHash = hashToken(payload.jti);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  } catch {
    // token already invalid/expired, nothing to revoke
  }
};
