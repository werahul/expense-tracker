import { Router } from 'express';
import * as expenseController from '../controllers/expense.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createExpenseSchema,
  listExpenseQuerySchema,
  updateExpenseSchema,
} from '../validation/expense.schema';

const router = Router();

router.use(requireAuth);

router.get('/', validate(listExpenseQuerySchema, 'query'), expenseController.list);
router.post('/', validate(createExpenseSchema), expenseController.create);
router.put('/:id', validate(updateExpenseSchema), expenseController.update);
router.delete('/:id', expenseController.remove);

export default router;
