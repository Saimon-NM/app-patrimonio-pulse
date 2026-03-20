import type { FC } from 'react';
import Card from '@/shared/components/ui/Card';
import InfoIcon from '@/shared/components/InfoIcon';
import { valueClass } from '@/shared/styles/tokens';
import { formatCurrencyWithIndicator, formatPercentWithIndicator } from '@/shared/utils/precision';
import type { Provider } from '@/features/accounts/model/provider.types';
import ReallocationRecommendationsPanel from '@/features/insights/components/ReallocationRecommendationsPanel';

interface InsightsPanelProps {
  goalLabel: string;
  percentToGoal: number;
  passiveMonthlyEstimate: number;
  passiveAnnualEstimate: number;
  suggestion: string;
  finalNominal: number;
  providers: Provider[];
}

const InsightTile: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/70 transition hover:border-white/30">
    <p className={`text-[0.58rem] sm:text-[0.65rem] uppercase tracking-[0.3em] text-white/50 leading-tight`}>
      {label}
    </p>
    <p className={`mt-1 break-words text-xs sm:text-base leading-tight ${valueClass}`}>
      {value}
    </p>
  </div>
);

const InsightsPanel: FC<InsightsPanelProps> = ({
  goalLabel,
  percentToGoal,
  passiveMonthlyEstimate,
  passiveAnnualEstimate,
  suggestion,
  finalNominal,
  providers,
}) => (
  <Card as="section" label="Insights inteligentes">
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-xs text-white/50 uppercase tracking-[0.4em]">Insights</p>
      <h3 className="text-lg font-semibold text-white">Proyección inteligente</h3>
      <InfoIcon label="Indica cuán cerca estás de la meta y cuánto generan tus pasivos" />
    </div>
    <div className="mt-4 grid gap-3 grid-cols-2 lg:grid-cols-4">
      <InsightTile label={goalLabel} value={`${formatPercentWithIndicator(percentToGoal)} de la meta`} />
      <InsightTile label="Capital nominal proyectado" value={formatCurrencyWithIndicator(finalNominal)} />
      <InsightTile label="Ingreso pasivo / mes" value={formatCurrencyWithIndicator(passiveMonthlyEstimate)} />
      <InsightTile label="Ingreso pasivo / año" value={formatCurrencyWithIndicator(passiveAnnualEstimate)} />
    </div>
    <p className="mt-3 text-[0.85rem] text-white/70">{suggestion}</p>

    <ReallocationRecommendationsPanel providers={providers} />
  </Card>
);

export default InsightsPanel;
