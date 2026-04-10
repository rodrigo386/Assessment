import { describe, it, expect } from 'vitest';
import { formatBRL, parseBRL } from './currency';

describe('formatBRL', () => {
  it('formats 0 as "R$ 0,00"', () => {
    expect(formatBRL(0)).toBe('R$ 0,00');
  });

  it('formats integer value with thousand separator', () => {
    expect(formatBRL(1234567)).toBe('R$ 1.234.567,00');
  });

  it('formats decimal value', () => {
    expect(formatBRL(1234567.89)).toBe('R$ 1.234.567,89');
  });

  it('rounds to 2 decimals', () => {
    expect(formatBRL(1.005)).toBe('R$ 1,01');
  });
});

describe('parseBRL', () => {
  it('parses "R$ 0,00" as 0', () => {
    expect(parseBRL('R$ 0,00')).toBe(0);
  });

  it('parses "R$ 1.234.567,89" as 1234567.89', () => {
    expect(parseBRL('R$ 1.234.567,89')).toBe(1234567.89);
  });

  it('parses bare digits "1234567" as 1234567', () => {
    expect(parseBRL('1234567')).toBe(1234567);
  });

  it('parses "1,50" as 1.5', () => {
    expect(parseBRL('1,50')).toBe(1.5);
  });

  it('returns 0 for empty string', () => {
    expect(parseBRL('')).toBe(0);
  });

  it('returns 0 for non-numeric garbage', () => {
    expect(parseBRL('abc')).toBe(0);
  });

  it('round-trips format → parse', () => {
    const values = [0, 1, 100, 1234.56, 1234567.89, 99999999.99];
    for (const v of values) {
      expect(parseBRL(formatBRL(v))).toBe(v);
    }
  });
});
