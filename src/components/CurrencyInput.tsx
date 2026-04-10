'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, parseCurrency } from '@/lib/currency';
import type { Currency } from '@/types/assessment';

interface CurrencyInputProps {
  value: number;
  currency: Currency;
  onChange: (value: number) => void;
  onCurrencyChange: (currency: Currency) => void;
  id?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export function CurrencyInput({
  value,
  currency,
  onChange,
  onCurrencyChange,
  id,
  required,
  placeholder,
  className,
}: CurrencyInputProps) {
  const [display, setDisplay] = useState<string>(() =>
    value > 0 ? formatCurrency(value, currency) : '',
  );

  // Reflect external value or currency changes (e.g., store rehydration, currency switch).
  useEffect(() => {
    setDisplay(value > 0 ? formatCurrency(value, currency) : ''); // eslint-disable-line react-hooks/set-state-in-effect
  }, [value, currency]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setDisplay(raw);
    onChange(parseCurrency(raw));
  }

  function handleBlur() {
    if (display.trim() === '') {
      onChange(0);
      return;
    }
    const parsed = parseCurrency(display);
    setDisplay(parsed > 0 ? formatCurrency(parsed, currency) : '');
    onChange(parsed);
  }

  return (
    <div className={['flex', className].filter(Boolean).join(' ')}>
      <select
        aria-label="Moeda"
        value={currency}
        onChange={(e) => onCurrencyChange(e.target.value as Currency)}
        className="rounded-l-lg border border-r-0 border-brand-border bg-brand-surface px-3 py-3 text-sm font-semibold text-brand-purple-light focus:border-brand-purple focus:outline-none"
      >
        <option value="BRL">R$ BRL</option>
        <option value="USD">US$ USD</option>
      </select>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        required={required}
        placeholder={placeholder ?? (currency === 'BRL' ? 'R$ 0' : 'US$ 0')}
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        className="flex-1 rounded-r-lg border border-brand-border bg-brand-surface px-4 py-3 text-base text-white placeholder:text-brand-muted focus:border-brand-purple focus:outline-none"
        autoComplete="off"
      />
    </div>
  );
}
