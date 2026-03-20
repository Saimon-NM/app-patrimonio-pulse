import { useMemo } from 'react';
import type { GoalConfig } from '@/features/settings/types/settings.types';
import type { ProjectionPoint } from '@/features/projections/model/projection.types';
import type { LegendEntryProps } from '@/shared/components/ui/LegendEntry';
import { formatShortCurrency } from '@/shared/utils/precision';

export type FocusMode = 'nominal' | 'real';
const MAX_CHART_POINTS = 180;

const downsampleSeries = <T,>(rows: T[], maxPoints = MAX_CHART_POINTS): T[] => {
  if (rows.length <= maxPoints) return rows;
  const stride = (rows.length - 1) / (maxPoints - 1);
  const sampled: T[] = [];
  for (let i = 0; i < maxPoints; i += 1) {
    const idx = Math.round(i * stride);
    sampled.push(rows[idx]);
  }
  return sampled;
};

export const DEFAULT_GOAL_COLORS = ['#ff6270', '#f97316', '#a855f7', '#22d3ee', '#4ade80'];

interface UseCapitalChartSeriesProps {
  data: ProjectionPoint[];
  baselineData: ProjectionPoint[];
  goals: Array<GoalConfig & { color?: string }>;
  currentCapital: number;
  activeGoalId: string;
  focus: FocusMode;
  secondaryFocus: FocusMode;
}

export const useCapitalChartSeries = ({
  data,
  baselineData,
  goals,
  currentCapital,
  activeGoalId,
  focus,
  secondaryFocus,
}: UseCapitalChartSeriesProps) =>
  useMemo(() => {
    const mergedDataRaw = data.map((point, index) => ({
      ...point,
      baselineNominal: baselineData[index]?.nominal ?? point.nominal,
    }));
    const mergedData = downsampleSeries(mergedDataRaw);
    const activeValues = data.map((point) => point[focus]);
    const secondaryValues = data.map((point) => point[secondaryFocus]);
    const baselineMax = baselineData.reduce((max, point) => Math.max(max, point.nominal), 0);
    const goalMax = goals.reduce((max, goalItem) => Math.max(max, goalItem.amount), 0);
    const absoluteMax = Math.max(goalMax, currentCapital, ...activeValues, ...secondaryValues, baselineMax);
    const axisMax =
      !Number.isFinite(absoluteMax) || absoluteMax <= 0 ? 100000 : Math.ceil(absoluteMax / 100000) * 100000;

    const goalLegendEntries: LegendEntryProps[] = goals.map((goalItem, index) => ({
      color: goalItem.color ?? DEFAULT_GOAL_COLORS[index % DEFAULT_GOAL_COLORS.length],
      label: goalItem.title,
      description: formatShortCurrency(goalItem.amount),
    }));

    const legendEntries: LegendEntryProps[] = [
      {
        color: '#2d86f3',
        label: 'Invirtiendo (nominal)',
        description: 'Capital + aportes mensuales con rendimiento compuesto.',
      },
      {
        color: '#e0ad3b',
        label: 'Invirtiendo (real)',
        description: 'Nominal ajustado por inflación proyectada.',
      },
      {
        color: '#9ca3af',
        label: 'Sin invertir',
        description: 'Solo el capital inicial sin aportes extra.',
      },
      ...goalLegendEntries,
    ];

    const activeGoal = goals.find((goalItem) => goalItem.id === activeGoalId) ?? goals[0];

    return {
      axisMax,
      mergedData,
      legendEntries,
      activeGoal,
    };
  }, [data, baselineData, goals, currentCapital, activeGoalId, focus, secondaryFocus]);
