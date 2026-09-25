import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../utils/apiError';

type RequestPart = 'body' | 'query' | 'params';

export const validate = (schema: ZodSchema, part: RequestPart = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      throw ApiError.badRequest('Validation failed', result.error.flatten().fieldErrors);
    }

    req[part] = result.data;
    next();
  };
};
