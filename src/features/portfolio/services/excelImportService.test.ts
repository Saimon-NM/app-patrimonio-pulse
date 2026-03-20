import { describe, expect, it } from 'vitest';
import {
  parseExcelNumber,
  parseExcelHoldingsFile,
  buildImportedAccount,
} from './excelImportService';

describe('parseExcelNumber', () => {
  it('parses US format: 1,234.56 (comma=thousands, dot=decimal)', () => {
    expect(parseExcelNumber('1,234.56')).toBe(1234.56);
    expect(parseExcelNumber('12,345.67')).toBe(12345.67);
  });

  it('parses EU format: 1.234,56 (dot=thousands, comma=decimal)', () => {
    expect(parseExcelNumber('1.234,56')).toBe(1234.56);
    expect(parseExcelNumber('1.234.567,89')).toBe(1234567.89);
  });

  it('parses ambiguous 1,234 as thousands (3 digits after comma)', () => {
    expect(parseExcelNumber('1,234')).toBe(1234);
    expect(parseExcelNumber('12,345')).toBe(12345);
  });

  it('parses ambiguous 1,23 as decimal', () => {
    expect(parseExcelNumber('1,23')).toBe(1.23);
    expect(parseExcelNumber('0,5')).toBe(0.5);
  });

  it('parses 1.234 as thousands when 3 digits after dot', () => {
    expect(parseExcelNumber('1.234')).toBe(1234);
  });

  it('parses 1.23 as decimal', () => {
    expect(parseExcelNumber('1.23')).toBe(1.23);
  });

  it('handles numeric input', () => {
    expect(parseExcelNumber(1234.56)).toBe(1234.56);
    expect(parseExcelNumber(0)).toBe(0);
  });

  it('returns 0 for invalid input', () => {
    expect(parseExcelNumber(null)).toBe(0);
    expect(parseExcelNumber('')).toBe(0);
    expect(parseExcelNumber('abc')).toBe(0);
  });
});

describe('parseExcelHoldingsFile', () => {
  it('returns empty holdings when sheet has no header row', async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([['A', 'B'], [1, 2]]);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const file = new File([buf], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const result = await parseExcelHoldingsFile(file);
    expect(result.holdings).toHaveLength(0);
  });

  it('parses GBM-style sheet with EMISORA and VALOR MERCADO', async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['EMISORA/FONDO', 'VALOR MERCADO', 'RENDIMIENTO'],
      ['VOO', '1,234.56', '8%'],
      ['VT', '50000', '7.5'],
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const file = new File([buf], 'gbm-export.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const result = await parseExcelHoldingsFile(file);
    expect(result.holdings).toHaveLength(2);
    expect(result.holdings[0].balance).toBe(1234.56);
    expect(result.holdings[0].name).toBe('VOO');
    expect(result.holdings[1].balance).toBe(50000);
  });
});

describe('buildImportedAccount', () => {
  it('sanitizes balance and rate within limits', () => {
    const account = buildImportedAccount({
      providerId: 'p1',
      holding: {
        app: 'gbm',
        key: 'VOO',
        name: 'VOO',
        balance: 1e15,
        rateAnnualPct: 150,
      },
      fallbackRateAnnualPct: 8,
    });
    expect(account.balance).toBeLessThanOrEqual(1e12);
    expect(account.rate).toBeLessThanOrEqual(100);
  });
});
