import { Request, Response } from 'express';
import * as categoryService from '../services/category.service';
import { asyncHandler } from '../utils/asyncHandler';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryService.listCategories(req.user!.userId);
  res.json(categories);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.user!.userId, req.body);
  res.status(201).json(category);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.updateCategory(req.user!.userId, req.params.id, req.body);
  res.json(category);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.deleteCategory(req.user!.userId, req.params.id);
  res.status(204).send();
});
