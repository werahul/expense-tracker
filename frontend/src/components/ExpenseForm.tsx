import { Plus, Sparkles, Tag, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { createCategory } from '../api/categories';
import type { Category, Currency, Expense } from '../types';
import { CURRENCIES, CURRENCY_SYMBOL } from '../utils/currency';
import Spinner from './Spinner';

interface ExpenseFormProps {
  categories: Category[];
  initial?: Expense;
  onSubmit: (data: {
    categoryId: string;
    amount: number;
    currency: Currency;
    description?: string;
    date: string;
  }) => Promise<void>;
  onCancel: () => void;
  onCategoryCreated: (category: Category) => void;
}

const swatches = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#0ea5e9', '#ef4444', '#64748b', '#8b5cf6'];

export default function ExpenseForm({ categories, initial, onSubmit, onCancel, onCategoryCreated }: ExpenseFormProps) {
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? '');
  const [amount, setAmount] = useState(initial?.amount ?? '');
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? 'USD');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [date, setDate] = useState(initial ? initial.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAddingCategory, setIsAddingCategory] = useState(categories.length === 0);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(swatches[0]);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsCreatingCategory(true);
    try {
      const category = await createCategory({ name: newCategoryName.trim(), color: newCategoryColor });
      onCategoryCreated(category);
      setCategoryId(category.id);
      setNewCategoryName('');
      setIsAddingCategory(false);
      toast.success(`Category "${category.name}" created`);
    } catch {
      toast.error('That category name is already taken');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError('Choose a category first');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ categoryId, amount: Number(amount), currency, description: description || undefined, date });
    } catch {
      setError('Could not save this expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="expense-category" className="block text-sm font-medium text-slate-700">
            Category
          </label>
          {categories.length > 0 && (
            <button
              type="button"
              onClick={() => setIsAddingCategory((v) => !v)}
              className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              <Plus size={13} />
              New category
            </button>
          )}
        </div>

        {!isAddingCategory && (
          <select
            id="expense-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        {isAddingCategory && (
          <div className="rounded-lg border border-dashed border-brand-300 bg-brand-50/50 p-3">
            {categories.length === 0 && (
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-brand-700">
                <Sparkles size={13} />
                You don't have any categories yet — create your first one
              </p>
            )}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Travel"
                  className="w-full rounded-md border border-slate-300 py-1.5 pl-7 pr-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
              {categories.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="rounded-md border border-slate-200 px-2 text-slate-400 hover:bg-white"
                  aria-label="Cancel new category"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              {swatches.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setNewCategoryColor(color)}
                  style={{ backgroundColor: color }}
                  className={`h-5 w-5 rounded-full transition ${
                    newCategoryColor === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                  }`}
                  aria-label={`Choose color ${color}`}
                />
              ))}
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={isCreatingCategory || !newCategoryName.trim()}
                className="ml-auto flex items-center gap-1 rounded-md bg-gradient-to-br from-brand-600 to-violet-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm transition hover:shadow disabled:opacity-50"
              >
                {isCreatingCategory ? <Spinner size={12} /> : <Plus size={12} />}
                Create
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="expense-amount" className="mb-1.5 block text-sm font-medium text-slate-700">
          Amount
        </label>
        <div className="flex overflow-hidden rounded-lg border border-slate-300 transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
          <div className="flex items-center divide-x divide-slate-200 border-r border-slate-200 bg-slate-50">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`px-2.5 py-2 text-sm font-semibold transition ${
                  currency === c ? 'bg-gradient-to-br from-brand-600 to-violet-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {CURRENCY_SYMBOL[c]}
              </button>
            ))}
          </div>
          <input
            id="expense-amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 text-sm focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="expense-date" className="mb-1.5 block text-sm font-medium text-slate-700">
          Date
        </label>
        <input
          id="expense-date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div>
        <label htmlFor="expense-description" className="mb-1.5 block text-sm font-medium text-slate-700">
          Description (optional)
        </label>
        <input
          id="expense-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting && <Spinner size={14} />}
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
