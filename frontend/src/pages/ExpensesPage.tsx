import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pencil, Plus, Receipt, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  createExpense,
  deleteExpense,
  fetchExpenses,
  updateExpense,
  type ExpenseFilters,
} from '../api/expenses';
import ConfirmDialog from '../components/ConfirmDialog';
import ExpenseForm from '../components/ExpenseForm';
import Modal from '../components/Modal';
import { useCategories } from '../hooks/useCategories';
import type { Currency, Expense } from '../types';
import { CURRENCIES, formatMoney } from '../utils/currency';

export default function ExpensesPage() {
  const { categories, reload: reloadCategories } = useCategories();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Omit<ExpenseFilters, 'page'>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchExpenses({ ...filters, page, pageSize: 10 });
      setExpenses(result.items);
      setTotalPages(result.pagination.totalPages);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFilterChange = (patch: Partial<ExpenseFilters>) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteExpense(pendingDelete.id);
      toast.success('Expense deleted');
      setPendingDelete(null);
      load();
    } catch {
      toast.error('Could not delete this expense');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500">Track and manage what you've spent.</p>
        </div>
        <button onClick={() => setIsCreating(true)} className="btn-primary">
          <Plus size={15} />
          Add expense
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02]">
        <div className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
          <SlidersHorizontal size={12} />
          Filters
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <select
            value={filters.categoryId ?? ''}
            onChange={(e) => handleFilterChange({ categoryId: e.target.value || undefined })}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={filters.currency ?? ''}
            onChange={(e) => handleFilterChange({ currency: (e.target.value || undefined) as Currency | undefined })}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            <option value="">All currencies</option>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={filters.startDate ?? ''}
            onChange={(e) => handleFilterChange({ startDate: e.target.value || undefined })}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="From"
          />
          <input
            type="date"
            value={filters.endDate ?? ''}
            onChange={(e) => handleFilterChange({ endDate: e.target.value || undefined })}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="To"
          />
          <input
            type="number"
            value={filters.minAmount ?? ''}
            onChange={(e) => handleFilterChange({ minAmount: e.target.value ? Number(e.target.value) : undefined })}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="Min amount"
          />
          <input
            type="number"
            value={filters.maxAmount ?? ''}
            onChange={(e) => handleFilterChange({ maxAmount: e.target.value ? Number(e.target.value) : undefined })}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="Max amount"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-none">
                  <td colSpan={5} className="px-4 py-3">
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  </td>
                </tr>
              ))
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Receipt size={18} />
                    </div>
                    <p className="text-sm text-slate-400">No expenses match these filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              expenses.map((expense, i) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
                  className="border-b border-slate-100 transition hover:bg-slate-50/70 last:border-none"
                >
                  <td className="px-4 py-3 text-slate-600">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                      style={{ backgroundColor: expense.category.color }}
                    >
                      {expense.category.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{expense.description ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">
                    {formatMoney(expense.amount, expense.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditing(expense)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                        aria-label="Edit expense"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setPendingDelete(expense)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete expense"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 transition hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft size={14} />
            Previous
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {isCreating && (
        <Modal title="Add expense" onClose={() => setIsCreating(false)}>
          <ExpenseForm
            categories={categories}
            onCategoryCreated={() => reloadCategories()}
            onSubmit={async (data) => {
              await createExpense(data);
              setIsCreating(false);
              toast.success('Expense added');
              load();
            }}
            onCancel={() => setIsCreating(false)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit expense" onClose={() => setEditing(null)}>
          <ExpenseForm
            categories={categories}
            initial={editing}
            onCategoryCreated={() => reloadCategories()}
            onSubmit={async (data) => {
              await updateExpense(editing.id, data);
              setEditing(null);
              toast.success('Expense updated');
              load();
            }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this expense?"
          description={`This will permanently remove the ${formatMoney(pendingDelete.amount, pendingDelete.currency)} expense from ${new Date(
            pendingDelete.date
          ).toLocaleDateString()}.`}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
