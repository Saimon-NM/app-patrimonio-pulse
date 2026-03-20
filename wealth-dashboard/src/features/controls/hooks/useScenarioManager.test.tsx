import { renderHook } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { useScenarioManager } from './useScenarioManager';

describe('useScenarioManager', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('sanitizes malformed scenarios read from storage', () => {
    window.localStorage.setItem(
      'patrimonio-scenarios',
      JSON.stringify([
        {
          name: 'agresivo',
          params: {
            income: -100,
            contribution: -50,
            yieldRate: 180,
            horizon: 0,
            inflation: -200,
            compoundingFrequency: 'weird',
          },
        },
      ])
    );

    const { result } = renderHook(() =>
      useScenarioManager(
        {
          income: 1000,
          contribution: 100,
          yieldRate: 8,
          horizon: 10,
          inflation: 4,
          compoundingFrequency: 'monthly',
        },
        vi.fn()
      )
    );

    expect(result.current.scenarios).toHaveLength(1);
    const saved = result.current.scenarios[0].params;
    expect(saved.income).toBe(0);
    expect(saved.contribution).toBe(0);
    expect(saved.yieldRate).toBe(100);
    expect(saved.horizon).toBe(1);
    expect(saved.inflation).toBe(-99);
    expect(saved.compoundingFrequency).toBe('monthly');
  });
});
