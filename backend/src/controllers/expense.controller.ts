import { Request, Response } from 'express';
import * as expenseService from '../services/expense.service';
import { asyncHandler } from '../utils/asyncHandler';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await expenseService.listExpenses(req.user!.userId, req.query as never);
  res.json(result);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.createExpense(req.user!.userId, req.body);
  res.status(201).json(expense);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.updateExpense(req.user!.userId, req.params.id, req.body);
  res.json(expense);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await expenseService.deleteExpense(req.user!.userId, req.params.id);
  res.status(204).send();
});
