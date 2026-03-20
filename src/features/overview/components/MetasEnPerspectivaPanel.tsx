import type { FC } from 'react';
import type { TimelineEstimate } from '@/shared/utils/finance';
import { formatCurrencyWithIndicator } from '@/shared/utils/precision';
import GoalTile from '@/shared/components/GoalTile';
import type { GoalImpactDetail } from '@/features/portfolio/hooks/useGoalImpact';

type GoalTimeline = {
  id: string;
  title: string;
  amount: number;
  percent: number;
  timeline: TimelineEstimate | null;
  color: string;
};

interface MetasEnPerspectivaPanelProps {
  baseTotal: number;
  goalTimelines: GoalTimeline[];
  goalDelayInfo: Record<string, GoalImpactDetail>;
  activeGoalId: string;
}

const formatTimelineLabel = (estimate: TimelineEstimate | null): string => {
  if (!estimate) {
    return 'Sin datos de proyección';
  }
  const parts: string[] = [];
  if (estimate.years) {
    parts.push(`${estimate.years} ${estimate.years === 1 ? 'año' : 'años'}`);
  }
  if (estimate.months) {
    parts.push(`${estimate.months} ${estimate.months === 1 ? 'mes' : 'meses'}`);
  }
  if (estimate.days || parts.length === 0) {
    parts.push(`${estimate.days} ${estimate.days === 1 ? 'día' : 'días'}`);
  }
  const base = parts.join(' ');
  return estimate.reached ? base : `Más de ${base}`;
};

const MetasEnPerspectivaPanel: FC<MetasEnPerspectivaPanelProps> = ({
  baseTotal,
  goalTimelines,
  goalDelayInfo,
  activeGoalId,
}) => {
  return (
    <div className="space-y-3 rounded-3xl border border-white/10 bg-black/40 p-4 shadow-xl">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Metas en perspectiva</p>
        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-white/60">
          Base: {formatCurrencyWithIndicator(baseTotal)}
        </span>
      </div>
      <div className="space-y-4">
        {goalTimelines.map((goal) => {
          const detail = goalDelayInfo[goal.id];
          const delayLabel = detail?.ownDelay?.label ?? '0 días';
          const messages =
            detail?.otherDelays?.map((other) => `Retrasarás ${other.title} por ${other.label}.`) ?? [];
          const isActive = goal.id === activeGoalId;

          return (
            <GoalTile
              key={`goal-${goal.id}`}
              title={goal.title}
              amount={goal.amount}
              percent={goal.percent}
              timelineLabel={formatTimelineLabel(goal.timeline)}
              delayLabel={delayLabel}
              progressColor={goal.color}
              isActive={isActive}
              messages={messages}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MetasEnPerspectivaPanel;

