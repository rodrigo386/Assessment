const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBRL(value: number): string {
  // Replace NBSP (U+00A0) inserted by Intl with a regular space for stable tests.
  return formatter.format(value).replace(/\u00A0/g, ' ');
}

export function parseBRL(raw: string): number {
  if (!raw) return 0;
  // Strip everything that isn't a digit, comma, dot, or minus.
  const cleaned = raw.replace(/[^\d,.\-]/g, '');
  if (!cleaned) return 0;
  // pt-BR: dots are thousand separators, comma is decimal separator.
  // Remove all dots, then replace comma with dot.
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}
