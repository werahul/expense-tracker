import { Request, Response } from 'express';
import * as budgetService from '../services/budget.service';
import { asyncHandler } from '../utils/asyncHandler';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const budgets = await budgetService.listBudgets(req.user!.userId, req.query as never);
  res.json(budgets);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const budget = await budgetService.createBudget(req.user!.userId, req.body);
  res.status(201).json(budget);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const budget = await budgetService.updateBudget(req.user!.userId, req.params.id, req.body);
  res.json(budget);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await budgetService.deleteBudget(req.user!.userId, req.params.id);
  res.status(204).send();
});
