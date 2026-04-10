export type Currency = 'BRL' | 'USD';

const FORMATTERS: Record<Currency, Intl.NumberFormat> = {
  BRL: new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }),
  USD: new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }),
};

/**
 * Format a numeric value as currency in pt-BR locale (whole units only, no cents).
 * Replaces the U+00A0 NBSP that Intl injects with a regular space for stable test output.
 */
export function formatCurrency(value: number, currency: Currency): string {
  const safe = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  return FORMATTERS[currency].format(safe).replace(/\u00A0/g, ' ');
}

/**
 * Parse a user-typed currency string into a whole-number value.
 * pt-BR convention: dots are thousand separators, comma is decimal — we drop the
 * fractional part since the app deals in whole units only.
 * Accepts garbage gracefully: empty / non-numeric → 0.
 */
export function parseCurrency(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^\d,.\-]/g, '');
  if (!cleaned) return 0;
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  const n = Number(normalized);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

// ---- Backward-compat shims ----
// Older code (and existing tests) call formatBRL / parseBRL directly. Keep these
// pointing at the new generic functions so callers don't need to change.
export function formatBRL(value: number): string {
  return formatCurrency(value, 'BRL');
}

export function parseBRL(raw: string): number {
  return parseCurrency(raw);
}
