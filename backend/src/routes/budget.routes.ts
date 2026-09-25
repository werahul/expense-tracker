import { Router } from 'express';
import * as budgetController from '../controllers/budget.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBudgetSchema, listBudgetQuerySchema, updateBudgetSchema } from '../validation/budget.schema';

const router = Router();

router.use(requireAuth);

router.get('/', validate(listBudgetQuerySchema, 'query'), budgetController.list);
router.post('/', validate(createBudgetSchema), budgetController.create);
router.put('/:id', validate(updateBudgetSchema), budgetController.update);
router.delete('/:id', budgetController.remove);

export default router;
