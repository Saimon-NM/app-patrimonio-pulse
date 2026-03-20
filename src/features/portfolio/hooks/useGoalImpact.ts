import { useMemo } from 'react';
import type { DashboardParameters } from '@/features/controls/hooks/useDashboardParameters';
import type { GoalConfig } from '@/features/settings/types/settings.types';
import { simulateTimeline, formatDurationFromDays } from '@/shared/utils/finance';

type DurationLabel = { days: number; label: string };
type DelayDetail = { title: string; days: number; label: string };

export interface GoalImpactDetail {
  ownDelay: DurationLabel | null;
  otherDelays: DelayDetail[];
}

interface UseGoalImpactInput {
  goals: GoalConfig[];
  totalCapital: number;
  params: DashboardParameters;
}

export const useGoalImpact = ({ goals, totalCapital, params }: UseGoalImpactInput) =>
  useMemo(() => {
    const results: Record<string, GoalImpactDetail> = {};

    const baseSimulations = new Map<string, ReturnType<typeof simulateTimeline>>();
    goals.forEach((goal) => {
      if (!goal.amount) {
        return;
      }
      baseSimulations.set(
        goal.id,
        simulateTimeline({
          initialCapital: totalCapital,
          monthlyContribution: params.contribution,
          annualRate: params.yieldRate,
          target: goal.amount,
          compoundingFrequency: params.compoundingFrequency,
          maxYears: params.horizon,
          inflationRate: params.inflation,
        })
      );
    });

    goals.forEach((goal) => {
      const base = baseSimulations.get(goal.id);
      if (!goal.amount || !base?.reachedReal) {
        results[goal.id] = { ownDelay: null, otherDelays: [] };
        return;
      }

      const scenarioSelf = simulateTimeline({
        initialCapital: Math.max(0, totalCapital - goal.amount),
        monthlyContribution: params.contribution,
        annualRate: params.yieldRate,
        target: goal.amount,
        compoundingFrequency: params.compoundingFrequency,
        maxYears: params.horizon,
        inflationRate: params.inflation,
      });
      const selfDiff = Math.max(0, scenarioSelf.realDays - base.realDays);
      const ownDelay = selfDiff === 0 ? null : { days: selfDiff, label: formatDurationFromDays(selfDiff) };

      const otherDelays = goals
        .filter((other) => other.id !== goal.id && other.amount)
        .map((other) => {
          const otherBaseline = baseSimulations.get(other.id);
          if (!otherBaseline?.reachedReal) {
            return null;
          }
          const otherScenario = simulateTimeline({
            initialCapital: Math.max(0, totalCapital - goal.amount),
            monthlyContribution: params.contribution,
            annualRate: params.yieldRate,
            target: other.amount,
            compoundingFrequency: params.compoundingFrequency,
            maxYears: params.horizon,
            inflationRate: params.inflation,
          });
          const diff = Math.max(0, otherScenario.realDays - otherBaseline.realDays);
          return diff ? { title: other.title, days: diff, label: formatDurationFromDays(diff) } : null;
        })
        .filter((item): item is DelayDetail => Boolean(item))
        .sort((a, b) => b.days - a.days);

      results[goal.id] = { ownDelay, otherDelays };
    });

    return results;
  }, [goals, totalCapital, params]);
