import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useReallocationRecommendations } from './useReallocationRecommendations';
import type { Provider } from '@/features/accounts/model/provider.types';

const createProvider = (
  id: string,
  name: string,
  accounts: Array<{
    id: string;
    name: string;
    balance: number;
    rate: number;
    maxBalance?: number;
    includeInRecommendations?: boolean;
  }>
): Provider => ({
  id,
  name,
  average: 0,
  total: '$0 MXN',
  accent: '#22c55e',
  accentLabel: '#22c55e',
  isNew: false,
  accounts: accounts.map((a) => ({
    id: a.id,
    name: a.name,
    desc: '',
    balance: a.balance,
    rate: a.rate,
    monthly: (a.balance * a.rate) / 1200,
    maxBalance: a.maxBalance,
    includeInRecommendations: a.includeInRecommendations ?? true,
    checklist: [],
    notes: '',
  })),
});

describe('useReallocationRecommendations', () => {
  it('returns empty when fewer than 2 scoped accounts', () => {
    const providers: Provider[] = [
      createProvider('p1', 'A', [{ id: 'a1', name: 'X', balance: 1000, rate: 8 }]),
    ];
    const { result } = renderHook(() => useReallocationRecommendations(providers));
    expect(result.current.topToIncrease).toHaveLength(0);
    expect(result.current.toReduce).toHaveLength(0);
    expect(result.current.scopedTotalMonthly).toBe(0);
  });

  it('suggests higher-yield account to increase and lower-yield to reduce', () => {
    const providers: Provider[] = [
      createProvider('p1', 'Low', [
        { id: 'a1', name: 'Savings', balance: 10000, rate: 5 },
      ]),
      createProvider('p2', 'High', [
        { id: 'a2', name: 'ETF', balance: 5000, rate: 10 },
      ]),
    ];
    const { result } = renderHook(() => useReallocationRecommendations(providers));
    expect(result.current.topToIncrease.length).toBeGreaterThan(0);
    expect(result.current.toReduce.length).toBeGreaterThan(0);
    expect(result.current.topToIncrease[0].rate).toBe(10);
    expect(result.current.toReduce[0].rate).toBe(5);
    expect(result.current.scopedTotalMonthly).toBeGreaterThan(0);
  });

  it('excludes accounts with includeInRecommendations false from scoped total', () => {
    const providers: Provider[] = [
      createProvider('p1', 'A', [
        { id: 'a1', name: 'X', balance: 10000, rate: 8, includeInRecommendations: true },
        { id: 'a2', name: 'Y', balance: 5000, rate: 6, includeInRecommendations: false },
      ]),
      createProvider('p2', 'B', [
        { id: 'a3', name: 'Z', balance: 3000, rate: 10, includeInRecommendations: true },
      ]),
    ];
    const { result } = renderHook(() => useReallocationRecommendations(providers));
    const expectedMonthly = (10000 * 8) / 1200 + (3000 * 10) / 1200;
    expect(result.current.scopedTotalMonthly).toBeCloseTo(expectedMonthly, 4);
    expect(result.current.topToIncrease.some((a) => a.accountName === 'Y')).toBe(false);
    expect(result.current.toReduce.some((a) => a.accountName === 'Y')).toBe(false);
  });

  it('excludes accounts at maxBalance from topToIncrease', () => {
    const providers: Provider[] = [
      createProvider('p1', 'A', [
        { id: 'a1', name: 'X', balance: 10000, rate: 10, maxBalance: 10000 },
      ]),
      createProvider('p2', 'B', [
        { id: 'a2', name: 'Y', balance: 5000, rate: 5 },
      ]),
    ];
    const { result } = renderHook(() => useReallocationRecommendations(providers));
    const cappedInTop = result.current.topToIncrease.find((a) => a.accountName === 'X');
    expect(cappedInTop).toBeUndefined();
    expect(result.current.toReduce.some((a) => a.accountName === 'Y')).toBe(true);
  });
});
