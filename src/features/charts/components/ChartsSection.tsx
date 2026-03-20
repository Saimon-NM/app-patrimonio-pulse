import { Suspense, lazy, type FC } from 'react';
import LoadingSkeleton from '@/shared/components/LoadingSkeleton';
import type { ProjectionPoint, DividendRecord } from '@/features/projections/model/projection.types';
import type { GoalConfig } from '@/features/settings/types/settings.types';

const CapitalChart = lazy(() => import('./CapitalChart'));
const DividendsChart = lazy(() => import('./DividendsChart'));

interface ChartsSectionProps {
  capitalPoints: ProjectionPoint[];
  baselinePoints: ProjectionPoint[];
  decoratedGoals: Array<GoalConfig & { color?: string }>;
  activeGoalId: string;
  currentCapital: number;
  dividendRecords: DividendRecord[];
  currentPassiveMonthly: number;
}

const ChartsSection: FC<ChartsSectionProps> = ({
  capitalPoints,
  baselinePoints,
  decoratedGoals,
  activeGoalId,
  currentCapital,
  dividendRecords,
  currentPassiveMonthly,
}) => (
  <section className="grid gap-6 lg:grid-cols-2 lg:items-start">
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="glass min-h-full rounded-3xl border border-white/10 bg-black/40 p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Gráfico</p>
                <p className="text-lg font-semibold text-white">Cargando proyección...</p>
              </div>
            </div>
            <div className="mt-6 h-64">
              <LoadingSkeleton />
            </div>
          </div>
        }
      >
        <CapitalChart
          data={capitalPoints}
          baselineData={baselinePoints}
          goals={decoratedGoals}
          activeGoalId={activeGoalId}
          currentCapital={currentCapital}
        />
      </Suspense>
    </div>
    <Suspense
      fallback={
        <div className="glass min-h-full rounded-3xl border border-white/10 bg-black/40 p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Gráfico</p>
              <p className="text-lg font-semibold text-white">Cargando dividendos...</p>
            </div>
          </div>
          <div className="mt-6 h-64">
            <LoadingSkeleton />
          </div>
        </div>
      }
    >
      <DividendsChart
        dividendRecords={dividendRecords}
        passiveMonthlyEstimate={currentPassiveMonthly}
        currentCapital={currentCapital}
      />
    </Suspense>
  </section>
);

export default ChartsSection;
