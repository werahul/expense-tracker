import { motion } from 'framer-motion';
import { PiggyBank, Receipt, TrendingDown, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchDashboardSummary } from '../api/dashboard';
import CategoryPieChart from '../components/CategoryPieChart';
import CurrencyToggle from '../components/CurrencyToggle';
import SummaryCard from '../components/SummaryCard';
import { useAuth } from '../context/AuthContext';
import type { Currency, DashboardSummary } from '../types';
import { formatMoney } from '../utils/currency';

const now = new Date();

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100" />
      <div className="mt-4 h-7 w-20 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth() + 1);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    fetchDashboardSummary(year, month, currency)
      .then((data) => {
        if (active) setSummary(data);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [year, month, currency]);

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-600 to-violet-700 p-6 text-white shadow-lg shadow-brand-600/25"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Hey {user?.name?.split(' ')[0]} 👋</h1>
            <p className="mt-0.5 text-sm text-white/80">Here's your spending overview for {monthLabel}</p>
          </div>
          <CurrencyToggle value={currency} onChange={setCurrency} />
        </div>
      </motion.div>

      {isLoading || !summary ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Total expenses"
              value={formatMoney(summary.totalExpenses, currency)}
              icon={Receipt}
              delay={0}
            />
            <SummaryCard
              label="Total budget"
              value={formatMoney(summary.totalBudget, currency)}
              icon={PiggyBank}
              delay={0.05}
            />
            <SummaryCard
              label="Remaining budget"
              value={formatMoney(summary.remainingBudget, currency)}
              icon={summary.remainingBudget < 0 ? TrendingDown : Wallet}
              tone={summary.remainingBudget < 0 ? 'negative' : 'positive'}
              delay={0.1}
            />
            <SummaryCard label="Transactions" value={String(summary.expenseCount)} icon={Wallet} delay={0.15} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]"
          >
            <h2 className="mb-4 text-sm font-semibold text-slate-700">Spending by category</h2>
            <CategoryPieChart
              data={summary.categoryBreakdown.map((c) => ({ name: c.name, total: c.total, color: c.color }))}
            />
          </motion.div>
        </>
      )}
    </div>
  );
}
