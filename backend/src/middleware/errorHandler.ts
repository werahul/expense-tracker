import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/apiError';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ message: err.message, details: err.details });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
};
