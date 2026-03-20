import { useMemo, useState } from 'react';
import type { CompoundFrequency } from '@/shared/utils/finance';

export interface DashboardParameters {
  income: number;
  contribution: number;
  yieldRate: number;
  horizon: number;
  inflation: number;
  compoundingFrequency: CompoundFrequency;
}

const initialState: DashboardParameters = {
  income: 20000,
  contribution: 6000,
  yieldRate: 8,
  horizon: 20,
  inflation: 4,
  compoundingFrequency: 'monthly',
};

const clampContribution = (value: number, income: number) => Math.min(value, income * 0.5);

export const useDashboardParameters = () => {
  const [params, setParams] = useState(initialState);

  const safeContribution = useMemo(() => clampContribution(params.contribution, params.income), [
    params.contribution,
    params.income,
  ]);

  const update = (updates: Partial<DashboardParameters>) => {
    setParams((prev) => ({ ...prev, ...updates }));
  };

  return {
    params: { ...params, contribution: safeContribution },
    setParams: update,
  };
};
