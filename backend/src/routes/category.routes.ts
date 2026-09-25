import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '../validation/category.schema';

const router = Router();

router.use(requireAuth);

router.get('/', categoryController.list);
router.post('/', validate(createCategorySchema), categoryController.create);
router.put('/:id', validate(updateCategorySchema), categoryController.update);
router.delete('/:id', categoryController.remove);

export default router;
