import { useMemo } from 'react';
import { formatCurrencyWithIndicator, formatPercentWithIndicator } from '@/shared/utils/precision';
import { calculateTimeline } from '@/shared/utils/finance';
import type { MetricCard } from '@/features/overview/components/SummaryPanel';
import type { SummaryStatRow } from '@/features/overview/components/SummaryStats';
import type { GoalConfig } from '@/features/settings/types/settings.types';
import type { ProjectionPoint } from '@/features/projections/model/projection.types';

const GOAL_COLORS = ['#ff6270', '#f97316', '#a855f7', '#22d3ee', '#4ade80'];

export type DecoratedGoal = GoalConfig & { color: string };
export type GoalWithProgress = DecoratedGoal & { percent: number };

interface UseDashboardViewModelInput {
  summary: {
    total: number;
    monthlyPassive: number;
    annualPassive: number;
    averageYield: number;
  };
  goals: GoalConfig[];
  activeGoalId: string;
  capitalPoints: ProjectionPoint[];
}

export const useDashboardViewModel = ({
  summary,
  goals,
  activeGoalId,
  capitalPoints,
}: UseDashboardViewModelInput) =>
  useMemo(() => {
    const decoratedGoals: DecoratedGoal[] = goals.map((goal, index) => ({
      ...goal,
      color: GOAL_COLORS[index % GOAL_COLORS.length],
    }));

    const metricCards: MetricCard[] = [
      {
        label: 'Ingreso pasivo / mes',
        value: formatCurrencyWithIndicator(summary.monthlyPassive),
        description: 'Estimación mensual',
        tone: 'success',
      },
      {
        label: 'Ingreso pasivo / año',
        value: formatCurrencyWithIndicator(summary.annualPassive),
        description: 'Sin aportes extra',
        tone: 'accent',
      },
      {
        label: 'Rend. promedio anual',
        value: `${formatPercentWithIndicator(summary.averageYield)} anual`,
        description: 'Promedio ponderado',
        tone: 'primary',
      },
    ];

    const summaryStats: SummaryStatRow[] = [
      {
        label: 'Capital total',
        value: formatCurrencyWithIndicator(summary.total),
        info: 'Suma de todos tus saldos ajustada a MXN',
      },
      {
        label: 'Ingreso pasivo mensual',
        value: formatCurrencyWithIndicator(summary.monthlyPassive),
        info: 'Estimación de dividendos, intereses y rentas por mes',
      },
      {
        label: 'Ingreso pasivo anual',
        value: formatCurrencyWithIndicator(summary.annualPassive),
        info: 'Acumula tus ingresos pasivos en 12 meses sin aportaciones',
      },
      {
        label: 'Rend. promedio anual',
        value: `${formatPercentWithIndicator(summary.averageYield)} anual`,
        info: 'Promedio ponderado por cuenta',
      },
    ];

    const activeGoal =
      decoratedGoals.find((goal) => goal.id === activeGoalId) ?? decoratedGoals[0];
    const activeGoalAmount = activeGoal?.amount ?? 0;
    const activeGoalTitle = activeGoal?.title ?? 'Meta principal';
    const goalLabel = `${activeGoalTitle} · ${formatCurrencyWithIndicator(activeGoalAmount)} MXN`;

    const goalProgress: GoalWithProgress[] = decoratedGoals.map((goal) => ({
      ...goal,
      percent: goal.amount > 0 ? Math.min(100, (summary.total / goal.amount) * 100) : 0,
    }));

    const percentById = goalProgress.reduce<Record<string, number>>((acc, goal) => {
      acc[goal.id] = goal.percent;
      return acc;
    }, {});

    const goalTimelines = decoratedGoals.map((goal) => ({
      ...goal,
      percent: percentById[goal.id] ?? 0,
      timeline: calculateTimeline(capitalPoints, goal.amount),
    }));

    return {
      decoratedGoals,
      metricCards,
      summaryStats,
      activeGoal,
      activeGoalAmount,
      goalLabel,
      goalProgress,
      percentById,
      goalTimelines,
    };
  }, [goals, summary, activeGoalId, capitalPoints]);

