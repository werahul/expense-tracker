import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, ListChecks } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { downloadReport, fetchMonthlyReport, fetchYearlyReport } from '../api/reports';
import CurrencyToggle from '../components/CurrencyToggle';
import Spinner from '../components/Spinner';
import type { Currency, MonthlyReport, YearlyReport } from '../types';
import { CURRENCY_SYMBOL } from '../utils/currency';

const now = new Date();
const monthNames = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleDateString('en-US', { month: 'short' })
);

export default function ReportsPage() {
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [yearly, setYearly] = useState<YearlyReport | null>(null);
  const [monthly, setMonthly] = useState<MonthlyReport | null>(null);
  const [exportingKey, setExportingKey] = useState<string | null>(null);

  useEffect(() => {
    fetchYearlyReport(year, currency).then(setYearly);
  }, [year, currency]);

  useEffect(() => {
    fetchMonthlyReport(year, month, currency).then(setMonthly);
  }, [year, month, currency]);

  const yearlyChartData = yearly?.byMonth.map((m) => ({ name: monthNames[m.month - 1], total: m.total })) ?? [];
  const symbol = CURRENCY_SYMBOL[currency];

  const handleExport = async (format: 'csv' | 'xlsx', scope: 'month' | 'year') => {
    const key = `${scope}-${format}`;
    setExportingKey(key);
    try {
      await downloadReport(year, scope === 'month' ? month : undefined, format, currency);
      toast.success('Download started');
    } catch {
      toast.error('Could not generate that export');
    } finally {
      setExportingKey(null);
    }
  };

  const exportButtons: { scope: 'month' | 'year'; format: 'csv' | 'xlsx'; label: string; icon: typeof FileText }[] = [
    { scope: 'month', format: 'csv', label: `${monthNames[month - 1]} CSV`, icon: FileText },
    { scope: 'month', format: 'xlsx', label: `${monthNames[month - 1]} Excel`, icon: FileSpreadsheet },
    { scope: 'year', format: 'csv', label: `${year} CSV`, icon: FileText },
    { scope: 'year', format: 'xlsx', label: `${year} Excel`, icon: FileSpreadsheet },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">Review trends and export your data.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CurrencyToggle value={currency} onChange={setCurrency} />
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            {monthNames.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-24 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]"
      >
        <h2 className="mb-4 text-sm font-semibold text-slate-700">
          Monthly totals for {year} <span className="text-slate-400">({currency})</span>
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={yearlyChartData}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value) => `${symbol}${Number(value).toFixed(2)}`}
              contentStyle={{ borderRadius: 10, borderColor: '#e2e8f0', fontSize: 13 }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} animationDuration={500} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]"
      >
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
          <ListChecks size={15} className="text-slate-400" />
          {monthNames[month - 1]} {year} breakdown
        </h2>
        {monthly && monthly.byCategory.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {monthly.byCategory.map((c) => (
              <li key={c.category} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-slate-600">{c.category}</span>
                <span className="font-semibold text-slate-800">
                  {symbol}
                  {c.total.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-4 text-sm text-slate-400">No expenses recorded for this month.</p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]"
      >
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
          <Download size={15} className="text-slate-400" />
          Export
        </h2>
        <div className="flex flex-wrap gap-2">
          {exportButtons.map(({ scope, format, label, icon: Icon }) => {
            const key = `${scope}-${format}`;
            const isBusy = exportingKey === key;
            return (
              <button
                key={key}
                disabled={exportingKey !== null}
                onClick={() => handleExport(format, scope)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
              >
                {isBusy ? <Spinner size={14} /> : <Icon size={14} />}
                {label}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
