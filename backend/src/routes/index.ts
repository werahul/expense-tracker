import { Router } from 'express';
import authRoutes from './auth.routes';
import budgetRoutes from './budget.routes';
import categoryRoutes from './category.routes';
import dashboardRoutes from './dashboard.routes';
import expenseRoutes from './expense.routes';
import reportRoutes from './report.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/expenses', expenseRoutes);
router.use('/budgets', budgetRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);

export default router;
