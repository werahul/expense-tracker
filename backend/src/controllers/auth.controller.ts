import { Request, Response } from 'express';
import { env } from '../config/env';
import * as authService from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';

const REFRESH_COOKIE = 'refreshToken';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/auth',
};

const sendAuthResponse = (
  res: Response,
  result: { user: { id: string; name: string; email: string }; accessToken: string; refreshToken: string },
  status = 200
) => {
  res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions);
  res.status(status).json({ user: result.user, accessToken: result.accessToken });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  sendAuthResponse(res, result, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  sendAuthResponse(res, result);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    throw ApiError.unauthorized('No refresh token provided');
  }

  const result = await authService.refresh(token);
  sendAuthResponse(res, result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    await authService.logout(token);
  }
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
  res.status(204).send();
});
