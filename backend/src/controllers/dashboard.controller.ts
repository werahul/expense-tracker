import type { Currency } from '@prisma/client';
import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboard.service';
import { asyncHandler } from '../utils/asyncHandler';

const parseCurrency = (value: unknown): Currency => (value === 'INR' ? 'INR' : 'USD');

export const summary = asyncHandler(async (req: Request, res: Response) => {
  const now = new Date();
  const year = Number(req.query.year) || now.getFullYear();
  const month = Number(req.query.month) || now.getMonth() + 1;
  const currency = parseCurrency(req.query.currency);

  const data = await dashboardService.getSummary(req.user!.userId, year, month, currency);
  res.json(data);
});
