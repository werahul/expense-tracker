import { motion } from 'framer-motion';
import { Pencil, PiggyBank, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createBudget, deleteBudget, fetchBudgets, updateBudget } from '../api/budgets';
import BudgetForm from '../components/BudgetForm';
import CategoryManager from '../components/CategoryManager';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import { useCategories } from '../hooks/useCategories';
import type { Budget } from '../types';
import { formatMoney } from '../utils/currency';

const now = new Date();

export default function BudgetsPage() {
  const { categories, reload: reloadCategories } = useCategories();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Budget | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchBudgets({ month, year });
      setBudgets(data);
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteBudget(pendingDelete.id);
      toast.success('Budget deleted');
      setPendingDelete(null);
      load();
    } catch {
      toast.error('Could not delete this budget');
    }
  };

  return (
    <div className="space-y-5">
      <CategoryManager categories={categories} onChange={reloadCategories} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Budgets</h1>
          <p className="text-sm text-slate-500">Set monthly limits per category and track your progress.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1, 1).toLocaleDateString('en-US', { month: 'long' })}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-24 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button onClick={() => setIsCreating(true)} className="btn-primary">
            <Plus size={15} />
            Add budget
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="h-5 w-24 animate-pulse rounded-full bg-slate-100" />
              <div className="mt-4 h-3 w-full animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-2 w-full animate-pulse rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <PiggyBank size={18} />
          </div>
          <p className="text-sm text-slate-400">No budgets set for this month yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {budgets.map((budget, i) => {
            const spent = Number(budget.spent);
            const limit = Number(budget.limitAmount);
            const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const overBudget = spent > limit;

            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.05, 0.3) }}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block rounded-full px-2.5 py-1 text-xs font-medium text-white"
                      style={{ backgroundColor: budget.category.color }}
                    >
                      {budget.category.name}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">
                      {budget.currency}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditing(budget)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                      aria-label="Edit budget"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setPendingDelete(budget)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete budget"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-800">{formatMoney(spent, budget.currency)}</span> of{' '}
                  {formatMoney(limit, budget.currency)}
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-2 rounded-full ${
                      overBudget ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-brand-500 to-violet-600'
                    }`}
                  />
                </div>
                {overBudget && <p className="mt-1.5 text-xs font-medium text-red-600">Over budget</p>}
              </motion.div>
            );
          })}
        </div>
      )}

      {isCreating && (
        <Modal title="Add budget" onClose={() => setIsCreating(false)}>
          <BudgetForm
            categories={categories}
            defaultMonth={month}
            defaultYear={year}
            onSubmit={async (data) => {
              await createBudget(data);
              setIsCreating(false);
              toast.success('Budget created');
              load();
            }}
            onCancel={() => setIsCreating(false)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit budget" onClose={() => setEditing(null)}>
          <BudgetForm
            categories={categories}
            defaultMonth={editing.month}
            defaultYear={editing.year}
            initial={editing}
            onSubmit={async (data) => {
              await updateBudget(editing.id, { limitAmount: data.limitAmount });
              setEditing(null);
              toast.success('Budget updated');
              load();
            }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this budget?"
          description={`This removes the ${pendingDelete.category.name} budget for ${new Date(
            pendingDelete.year,
            pendingDelete.month - 1
          ).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.`}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
