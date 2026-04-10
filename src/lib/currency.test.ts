import { describe, it, expect } from 'vitest';
import { formatBRL, parseBRL, formatCurrency, parseCurrency } from './currency';

describe('formatBRL (no decimals)', () => {
  it('formats 0 as "R$ 0"', () => {
    expect(formatBRL(0)).toBe('R$ 0');
  });

  it('formats integer value with thousand separator', () => {
    expect(formatBRL(1234567)).toBe('R$ 1.234.567');
  });

  it('rounds fractional input to whole number', () => {
    expect(formatBRL(1234567.89)).toBe('R$ 1.234.568');
  });

  it('clamps negative input to 0', () => {
    expect(formatBRL(-100)).toBe('R$ 0');
  });
});

describe('formatCurrency (USD with pt-BR locale)', () => {
  it('formats USD 0 as "US$ 0"', () => {
    expect(formatCurrency(0, 'USD')).toBe('US$ 0');
  });

  it('formats USD with pt-BR thousand separators', () => {
    expect(formatCurrency(1234567, 'USD')).toBe('US$ 1.234.567');
  });

  it('rounds fractional USD to whole number', () => {
    expect(formatCurrency(1500.7, 'USD')).toBe('US$ 1.501');
  });
});

describe('parseBRL / parseCurrency', () => {
  it('parses "R$ 0" as 0', () => {
    expect(parseBRL('R$ 0')).toBe(0);
  });

  it('parses "R$ 1.234.567" as 1234567', () => {
    expect(parseBRL('R$ 1.234.567')).toBe(1234567);
  });

  it('parses bare digits "1234567" as 1234567', () => {
    expect(parseBRL('1234567')).toBe(1234567);
  });

  it('drops fractional part from "R$ 1.234,99"', () => {
    expect(parseBRL('R$ 1.234,99')).toBe(1234);
  });

  it('returns 0 for empty string', () => {
    expect(parseBRL('')).toBe(0);
  });

  it('returns 0 for non-numeric garbage', () => {
    expect(parseBRL('abc')).toBe(0);
  });

  it('parses USD-formatted (pt-BR locale) input the same way', () => {
    expect(parseCurrency('US$ 1.234.567')).toBe(1234567);
  });

  it('round-trips format → parse for whole-number values', () => {
    const values = [0, 1, 100, 1234, 1234567, 99999999];
    for (const v of values) {
      expect(parseBRL(formatBRL(v))).toBe(v);
      expect(parseCurrency(formatCurrency(v, 'USD'))).toBe(v);
    }
  });
});
