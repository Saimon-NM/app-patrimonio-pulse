import { useMemo } from 'react';
import { annualRateToPeriodicRate } from '@/shared/utils/finance';
import { sanitizeNumber } from '@/shared/utils/validators';
import type {
  DividendRecord,
  ProjectionInput,
  ProjectionResult,
} from '@/features/projections/model/projection.types';

export interface ExtendedProjectionResult extends ProjectionResult {
  currentPassiveMonthly: number;
  projectedPassiveMonthly: number;
}

const MONTHS_PER_YEAR = 12;

interface SeriesOptions {
  startYear: number;
  horizon: number;
  capital: number;
  monthlyContribution: number;
  monthlyRate: number;
  monthlyDividendRate: number;
  inflationFactor: number;
  recordDividends: boolean;
}

const simulateSeries = ({
  startYear,
  horizon,
  capital,
  monthlyContribution,
  monthlyRate,
  monthlyDividendRate,
  inflationFactor,
  recordDividends,
}: SeriesOptions) => {
  const capitalPoints: ProjectionResult['capitalPoints'] = [
    { year: startYear, nominal: capital, real: capital },
  ];
  const dividendRecords: DividendRecord[] = [];

  let balance = capital;
  let cumulativeDividend = 0;

  for (let yearIndex = 1; yearIndex <= horizon; yearIndex += 1) {
    let annualDividend = 0;
    const monthlyBreakdown: number[] = [];

    for (let month = 0; month < MONTHS_PER_YEAR; month += 1) {
      if (recordDividends) {
        const monthlyDividend = balance * monthlyDividendRate;
        monthlyBreakdown.push(monthlyDividend);
        annualDividend += monthlyDividend;
      }
      balance = (balance + monthlyContribution) * (1 + monthlyRate);
    }

    if (recordDividends) {
      cumulativeDividend += annualDividend;
      dividendRecords.push({
        year: startYear + yearIndex,
        anual: annualDividend,
        mensual: annualDividend / MONTHS_PER_YEAR,
        acumulado: cumulativeDividend,
        monthlyBreakdown,
      });
    }

    const real = balance / inflationFactor ** yearIndex;
    capitalPoints.push({ year: startYear + yearIndex, nominal: balance, real });
  }

  return { capitalPoints, dividendRecords };
};

const calculatePassiveMonthly = (capital: number, yieldRate: number) =>
  (capital * (yieldRate / 100)) / MONTHS_PER_YEAR;

export const useCapitalProjection = (input: ProjectionInput): ExtendedProjectionResult =>
  useMemo(() => {
    const startYear = new Date().getFullYear();
    const safeHorizon = Math.floor(sanitizeNumber(input.horizon, { min: 1, max: 80, fallback: 1 }));
    const safeCapital = sanitizeNumber(input.currentCapital, { min: 0, fallback: 0 });
    const safeContribution = sanitizeNumber(input.contribution, { min: 0, fallback: 0 });
    const safeYieldRate = sanitizeNumber(input.yieldRate, { min: 0, max: 100, fallback: 0 });
    const safeInflation = sanitizeNumber(input.inflation, { min: -99, max: 100, fallback: 0 });

    const monthlyRate = annualRateToPeriodicRate(safeYieldRate, MONTHS_PER_YEAR);
    const monthlyDividendRate = safeYieldRate / 100 / MONTHS_PER_YEAR;
    const inflationFactor = 1 + safeInflation / 100;

    const projection = simulateSeries({
      startYear,
      horizon: safeHorizon,
      capital: safeCapital,
      monthlyContribution: safeContribution,
      monthlyRate,
      monthlyDividendRate,
      inflationFactor,
      recordDividends: true,
    });

    const baseline = simulateSeries({
      startYear,
      horizon: safeHorizon,
      capital: safeCapital,
      monthlyContribution: 0,
      monthlyRate,
      monthlyDividendRate: 0,
      inflationFactor,
      recordDividends: false,
    });

    return {
      capitalPoints: projection.capitalPoints,
      baselinePoints: baseline.capitalPoints,
      dividendRecords: projection.dividendRecords,
      currentPassiveMonthly: calculatePassiveMonthly(safeCapital, safeYieldRate),
      projectedPassiveMonthly: calculatePassiveMonthly(
        projection.capitalPoints[projection.capitalPoints.length - 1].nominal,
        safeYieldRate
      ),
      // Mantenemos compatibilidad con tipos si existe passiveMonthlyEstimate:
      passiveMonthlyEstimate: calculatePassiveMonthly(safeCapital, safeYieldRate),
    };
  }, [
    input.currentCapital,
    input.contribution,
    input.horizon,
    input.yieldRate,
    input.inflation,
  ]);
