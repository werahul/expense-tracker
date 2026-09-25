import { motion } from 'framer-motion';
import { CURRENCIES, CURRENCY_SYMBOL } from '../utils/currency';
import type { Currency } from '../types';

interface CurrencyToggleProps {
  value: Currency;
  onChange: (currency: Currency) => void;
}

export default function CurrencyToggle({ value, onChange }: CurrencyToggleProps) {
  return (
    <div className="relative inline-flex rounded-xl bg-slate-100 p-1">
      {CURRENCIES.map((currency) => (
        <button
          key={currency}
          onClick={() => onChange(currency)}
          className="relative z-10 flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        >
          {value === currency && (
            <motion.div
              layoutId="currency-toggle-pill"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute inset-0 rounded-lg bg-gradient-to-br from-brand-600 to-violet-600 shadow-sm"
            />
          )}
          <span className={`relative z-10 ${value === currency ? 'text-white' : 'text-slate-500'}`}>
            {CURRENCY_SYMBOL[currency]} {currency}
          </span>
        </button>
      ))}
    </div>
  );
}
