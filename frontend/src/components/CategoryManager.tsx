import { Plus, Tags, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { createCategory, deleteCategory } from '../api/categories';
import type { Category } from '../types';
import Spinner from './Spinner';

interface CategoryManagerProps {
  categories: Category[];
  onChange: () => void;
}

const swatches = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#0ea5e9', '#ef4444', '#64748b', '#8b5cf6'];

export default function CategoryManager({ categories, onChange }: CategoryManagerProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(swatches[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await createCategory({ name: name.trim(), color });
      setName('');
      onChange();
      toast.success('Category added');
    } catch {
      toast.error('That category already exists');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      onChange();
      toast.success('Category removed');
    } catch {
      toast.error('This category still has expenses linked to it and cannot be deleted');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
      <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
        <Tags size={15} className="text-slate-400" />
        Categories
      </div>
      <ul className="mb-4 flex flex-wrap gap-2">
        {categories.length === 0 && (
          <li className="text-sm text-slate-400">No categories yet — add your first one below.</li>
        )}
        {categories.map((c) => (
          <li
            key={c.id}
            className="flex items-center gap-1.5 rounded-full py-1 pl-3 pr-1.5 text-xs font-medium text-white shadow-sm"
            style={{ backgroundColor: c.color }}
          >
            {c.name}
            <button
              onClick={() => handleDelete(c.id)}
              className="rounded-full p-0.5 opacity-80 transition hover:bg-black/15 hover:opacity-100"
              aria-label={`Remove ${c.name}`}
            >
              <X size={12} />
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="min-w-[160px] flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <div className="flex items-center gap-1">
          {swatches.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setColor(s)}
              style={{ backgroundColor: s }}
              className={`h-5 w-5 rounded-full transition ${color === s ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
              aria-label={`Choose color ${s}`}
            />
          ))}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {isSubmitting ? <Spinner size={14} /> : <Plus size={14} />}
          Add
        </button>
      </form>
    </div>
  );
}
