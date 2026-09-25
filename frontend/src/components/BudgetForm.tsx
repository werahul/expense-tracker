import { useState, type FormEvent } from 'react';
import type { Budget, Category, Currency } from '../types';
import { CURRENCIES, CURRENCY_SYMBOL } from '../utils/currency';
import Spinner from './Spinner';

interface BudgetFormProps {
  categories: Category[];
  defaultMonth: number;
  defaultYear: number;
  initial?: Budget;
  onSubmit: (data: { categoryId: string; month: number; year: number; limitAmount: number; currency: Currency }) => Promise<void>;
  onCancel: () => void;
}

export default function BudgetForm({ categories, defaultMonth, defaultYear, initial, onSubmit, onCancel }: BudgetFormProps) {
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? '');
  const [month, setMonth] = useState(initial?.month ?? defaultMonth);
  const [year, setYear] = useState(initial?.year ?? defaultYear);
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? 'USD');
  const [limitAmount, setLimitAmount] = useState(initial?.limitAmount ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(initial);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError('Choose a category first');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ categoryId, month, year, limitAmount: Number(limitAmount), currency });
    } catch {
      setError('Could not save this budget. A budget for this category, month, and currency may already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isEditing ? (
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
          <span
            className="inline-block rounded-full px-2.5 py-1 text-xs font-medium text-white"
            style={{ backgroundColor: initial!.category.color }}
          >
            {initial!.category.name}
          </span>
          <span>
            {new Date(2000, month - 1, 1).toLocaleDateString('en-US', { month: 'long' })} {year} ·{' '}
            {CURRENCY_SYMBOL[currency]} {currency}
          </span>
        </div>
      ) : (
        <>
          <div>
            <label htmlFor="budget-category" className="mb-1.5 block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              id="budget-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="budget-month" className="mb-1.5 block text-sm font-medium text-slate-700">
                Month
              </label>
              <select
                id="budget-month"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1, 1).toLocaleDateString('en-US', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="budget-year" className="mb-1.5 block text-sm font-medium text-slate-700">
                Year
              </label>
              <input
                id="budget-year"
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
        </>
      )}

      <div>
        <label htmlFor="budget-limit" className="mb-1.5 block text-sm font-medium text-slate-700">
          Monthly limit
        </label>
        <div className="flex overflow-hidden rounded-lg border border-slate-300 transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
          <div className="flex items-center divide-x divide-slate-200 border-r border-slate-200 bg-slate-50">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                disabled={isEditing}
                onClick={() => setCurrency(c)}
                className={`px-2.5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${
                  currency === c ? 'bg-gradient-to-br from-brand-600 to-violet-600 text-white' : 'text-slate-500 hover:bg-slate-100 disabled:hover:bg-transparent'
                }`}
              >
                {CURRENCY_SYMBOL[c]}
              </button>
            ))}
          </div>
          <input
            id="budget-limit"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={limitAmount}
            onChange={(e) => setLimitAmount(e.target.value)}
            className="w-full px-3 py-2 text-sm focus:outline-none"
          />
        </div>
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
