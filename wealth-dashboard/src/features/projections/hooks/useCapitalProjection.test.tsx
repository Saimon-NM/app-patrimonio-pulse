import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCapitalProjection } from './useCapitalProjection';
import type { ProjectionResult } from '@/features/projections/model/projection.types';

describe('useCapitalProjection', () => {
  it('aligns yearly dividend records with the projected horizon', () => {
    let projection = null as ProjectionResult | null;

    const Test = () => {
      projection = useCapitalProjection({
        currentCapital: 100000,
        contribution: 1000,
        horizon: 2,
        yieldRate: 12,
        dividendYield: 6,
        inflation: 4,
      });
      return null;
    };

    render(<Test />);

    if (!projection) {
      throw new Error('projection not initialized');
    }

    const receivedProjection = projection as ProjectionResult;
    const currentYear = new Date().getFullYear();

    expect(receivedProjection.capitalPoints).toHaveLength(3);
    expect(receivedProjection.capitalPoints[0].year).toBe(currentYear);
    expect(receivedProjection.capitalPoints[2].year).toBe(currentYear + 2);
    expect(receivedProjection.dividendRecords).toHaveLength(2);
    expect(receivedProjection.dividendRecords[0].year).toBe(currentYear + 1);
    expect(receivedProjection.dividendRecords[1].year).toBe(currentYear + 2);
  });

  it('uses yieldRate consistently for capital growth and dividend projection', () => {
    const Test = () => {
      const projection = useCapitalProjection({
        currentCapital: 100000,
        contribution: 0,
        horizon: 1,
        yieldRate: 12,
        dividendYield: 6,
        inflation: 0,
      });
      expect(projection).toBeDefined();
      const finalNominal = projection.capitalPoints[projection.capitalPoints.length - 1].nominal;
      const expectedPassiveMonthly = (finalNominal * 12) / 100 / 12;
      expect(projection.projectedPassiveMonthly).toBeCloseTo(expectedPassiveMonthly, 6);
      return null;
    };
    render(<Test />);
  });

  it('sanitizes unsafe projection inputs to avoid invalid outputs', () => {
    const Test = () => {
      const projection = useCapitalProjection({
        currentCapital: -1000,
        contribution: -500,
        horizon: 0,
        yieldRate: 200,
        dividendYield: 10,
        inflation: -150,
      });

      expect(projection.capitalPoints).toHaveLength(2);
      expect(projection.capitalPoints[0].nominal).toBe(0);
      expect(projection.capitalPoints[1].nominal).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(projection.projectedPassiveMonthly)).toBe(true);
      return null;
    };
    render(<Test />);
  });
});
