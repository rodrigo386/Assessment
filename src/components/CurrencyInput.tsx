'use client';

import { useState, useEffect } from 'react';
import { formatBRL, parseBRL } from '@/lib/currency';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export function CurrencyInput({ value, onChange, id, required, placeholder, className }: CurrencyInputProps) {
  const [display, setDisplay] = useState<string>(() => (value > 0 ? formatBRL(value) : ''));

  // Reflect external value changes (e.g., store rehydration).
  useEffect(() => {
    setDisplay(value > 0 ? formatBRL(value) : ''); // eslint-disable-line react-hooks/set-state-in-effect
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setDisplay(raw);
    onChange(parseBRL(raw));
  }

  function handleBlur() {
    if (display.trim() === '') {
      onChange(0);
      return;
    }
    const parsed = parseBRL(display);
    setDisplay(parsed > 0 ? formatBRL(parsed) : '');
    onChange(parsed);
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      required={required}
      placeholder={placeholder ?? 'R$ 0,00'}
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      autoComplete="off"
    />
  );
}
