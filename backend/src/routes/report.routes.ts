import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);
router.get('/monthly', reportController.monthly);
router.get('/yearly', reportController.yearly);
router.get('/export', reportController.exportReport);

export default router;
