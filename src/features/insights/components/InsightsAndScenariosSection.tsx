import type { FC } from 'react';
import type { Provider } from '@/features/accounts/model/provider.types';
import type { SavedScenario } from '@/features/controls/hooks/useScenarioManager';
import InsightsPanel from './InsightsPanel';
import ScenarioPanel from '@/features/controls/components/ScenarioPanel';
import MetasEnPerspectivaPanel from '@/features/overview/components/MetasEnPerspectivaPanel';
import type { TimelineEstimate } from '@/shared/utils/finance';
import type { GoalImpactDetail } from '@/features/portfolio/hooks/useGoalImpact';

interface InsightsAndScenariosSectionProps {
  goalLabelForInsights: string;
  insights: {
    percentToGoal: number;
    passiveMonthlyEstimate: number;
    passiveAnnualEstimate: number;
    suggestion: string;
    finalNominal: number;
  };
  providers: Provider[];
  scenarios: SavedScenario[];
  onApplyScenario: (scenario: SavedScenario) => void;
  onRemoveScenario: (name: string) => void;
  summaryTotal: number;
  goalTimelines: Array<{
    id: string;
    title: string;
    amount: number;
    percent: number;
    timeline: TimelineEstimate | null;
    color: string;
  }>;
  goalDelayInfo: Record<string, GoalImpactDetail>;
  activeGoalId: string;
}

const InsightsAndScenariosSection: FC<InsightsAndScenariosSectionProps> = ({
  goalLabelForInsights,
  insights,
  providers,
  scenarios,
  onApplyScenario,
  onRemoveScenario,
  summaryTotal,
  goalTimelines,
  goalDelayInfo,
  activeGoalId,
}) => (
  <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
    <InsightsPanel
      goalLabel={goalLabelForInsights}
      percentToGoal={insights.percentToGoal}
      passiveMonthlyEstimate={insights.passiveMonthlyEstimate}
      passiveAnnualEstimate={insights.passiveAnnualEstimate}
      suggestion={insights.suggestion}
      finalNominal={insights.finalNominal}
      providers={providers}
    />
    <div className="space-y-6">
      <ScenarioPanel scenarios={scenarios} onApply={onApplyScenario} onRemove={onRemoveScenario} />
      <MetasEnPerspectivaPanel
        baseTotal={summaryTotal}
        goalTimelines={goalTimelines}
        goalDelayInfo={goalDelayInfo}
        activeGoalId={activeGoalId}
      />
    </div>
  </div>
);

export default InsightsAndScenariosSection;
