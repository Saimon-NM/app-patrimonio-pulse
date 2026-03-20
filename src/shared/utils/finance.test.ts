import { describe, expect, it } from 'vitest';
import { annualRateToPeriodicRate, calculateTimeline, simulateTimeline } from './finance';

describe('simulateTimeline', () => {
  it('compounds monthly contributions inside the same period', () => {
    const result = simulateTimeline({
      initialCapital: 0,
      monthlyContribution: 1000,
      annualRate: 12,
      target: 50000,
      compoundingFrequency: 'monthly',
      maxYears: 5,
    });

    const totalContributions = 1000 * result.nominalMonths;
    expect(result.finalNominalCapital).toBeGreaterThan(totalContributions);
  });

  it('marks target as unreachable when no growth is provided', () => {
    const result = simulateTimeline({
      initialCapital: 10000,
      monthlyContribution: 0,
      annualRate: 0,
      target: 50000,
      maxYears: 3,
    });

    expect(result.reachedNominal).toBe(false);
    expect(result.nominalMonths).toBe(36);
  });

  it('uses an effective annual-to-monthly conversion for monthly compounding', () => {
    const result = simulateTimeline({
      initialCapital: 1000,
      monthlyContribution: 0,
      annualRate: 12,
      target: 10000,
      compoundingFrequency: 'monthly',
      maxYears: 1,
    });

    const expectedMonthlyRate = annualRateToPeriodicRate(12, 12);
    const expectedFinalCapital = 1000 * (1 + expectedMonthlyRate) ** 12;

    expect(result.finalNominalCapital).toBeCloseTo(expectedFinalCapital, 8);
  });
});

describe('calculateTimeline', () => {
  it('returns reached true when target inside first point', () => {
    const estimate = calculateTimeline([
      { year: 2024, nominal: 15000 },
      { year: 2025, nominal: 30000 },
    ], 10000);

    expect(estimate?.reached).toBe(true);
    expect(estimate?.years).toBe(0);
  });
});
