import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: 'default' | 'positive' | 'negative';
  delay?: number;
}

const toneStyles: Record<string, { text: string; iconBg: string }> = {
  default: { text: 'text-slate-900', iconBg: 'bg-gradient-to-br from-brand-500 to-violet-600 shadow-brand-600/30' },
  positive: { text: 'text-emerald-600', iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-600/30' },
  negative: { text: 'text-red-600', iconBg: 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-600/30' },
};

export default function SummaryCard({ label, value, icon: Icon, tone = 'default', delay = 0 }: SummaryCardProps) {
  const styles = toneStyles[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02] transition hover:shadow-lg hover:shadow-slate-900/[0.06]"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg ${styles.iconBg}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className={`mt-3 text-2xl font-bold tracking-tight ${styles.text}`}>{value}</p>
    </motion.div>
  );
}
