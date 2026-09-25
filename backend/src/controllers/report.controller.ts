import type { Currency } from '@prisma/client';
import { Request, Response } from 'express';
import * as reportService from '../services/report.service';
import { asyncHandler } from '../utils/asyncHandler';

const parseCurrency = (value: unknown): Currency => (value === 'INR' ? 'INR' : 'USD');

export const monthly = asyncHandler(async (req: Request, res: Response) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  const currency = parseCurrency(req.query.currency);
  const data = await reportService.getMonthlyReport(req.user!.userId, year, month, currency);
  res.json(data);
});

export const yearly = asyncHandler(async (req: Request, res: Response) => {
  const year = Number(req.query.year);
  const currency = parseCurrency(req.query.currency);
  const data = await reportService.getYearlyReport(req.user!.userId, year, currency);
  res.json(data);
});

export const exportReport = asyncHandler(async (req: Request, res: Response) => {
  const year = Number(req.query.year);
  const month = req.query.month ? Number(req.query.month) : undefined;
  const format = req.query.format === 'xlsx' ? 'xlsx' : 'csv';
  const currency = parseCurrency(req.query.currency);

  const { buffer, contentType } = await reportService.buildExport(req.user!.userId, year, month, format, currency);

  const filename = `expenses-${year}${month ? `-${String(month).padStart(2, '0')}` : ''}-${currency}.${format}`;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
});
