import type { FC } from 'react';
import OverviewSummary from './SummaryPanel';
import SummaryStats from './SummaryStats';
import RangeControl from '@/shared/components/RangeControl';
import InfoIcon from '@/shared/components/InfoIcon';
import { formatCurrencyWithIndicator, formatPercentWithIndicator } from '@/shared/utils/precision';
import type { DashboardParameters } from '@/features/controls/hooks/useDashboardParameters';
import type { AppSettings } from '@/features/settings/types/settings.types';
import type { SummarySnapshot } from '@/features/overview/data/summary.data';
import type { MetricCard } from './SummaryPanel';
import type { SummaryStatRow } from './SummaryStats';

type SavingPalette = {
  badge: string;
  messageBox: string;
  trackColor: string;
};

type SliderHandler = (field: keyof DashboardParameters) => (value: number) => void;

interface OverviewAndSimulatorSectionProps {
  summary: SummarySnapshot;
  allocationBreakdown: Array<{ name: string; percent: number; color: string }>;
  metricCards: MetricCard[];
  settings: AppSettings;
  summaryStats: SummaryStatRow[];
  params: DashboardParameters;
  savingPercent: number;
  savingStatus: string;
  savingMessage: string;
  savingPalette: SavingPalette;
  targetStatement: string;
  onHandleSliderChange: SliderHandler;
  onHandleSaveScenario: () => void;
  scenarioSaveStatus: 'idle' | 'saving' | 'saved';
  scenarioSaveMessage: string | null;
}

const OverviewAndSimulatorSection: FC<OverviewAndSimulatorSectionProps> = ({
  summary,
  allocationBreakdown,
  metricCards,
  settings,
  summaryStats,
  params,
  savingPercent,
  savingStatus,
  savingMessage,
  savingPalette,
  targetStatement,
  onHandleSliderChange,
  onHandleSaveScenario,
  scenarioSaveStatus,
  scenarioSaveMessage,
}) => (
  <section className="grid gap-6 xl:grid-cols-[1.35fr,1fr] xl:items-start">
    <div className="grid gap-6">
      <OverviewSummary
        summary={summary}
        allocation={allocationBreakdown}
        metricCards={metricCards}
        usdRate={settings.usdRate}
        currencies={settings.currencies}
        className="mb-0"
      />
      <SummaryStats summary={summary} stats={summaryStats} />
    </div>
    <div>
      <article className="glass rounded-3xl border border-white/10 bg-black/40 p-6 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">Tu ingreso mensual</h2>
              <InfoIcon label="Define ingresos, aportaciones y metas para ver el impacto en tu patrimonio" />
            </div>
            <p className="text-sm text-white/60">Arrastra los controles para ver cómo reaccionan tus metas.</p>
            <p className="mt-2 text-sm text-white/60">
              Al guardar un escenario se guardan los sliders actuales: ingreso{' '}
              <span className="font-semibold text-white">{formatCurrencyWithIndicator(params.income)}</span>,
              aportación{' '}
              <span className="font-semibold text-white">
                {formatCurrencyWithIndicator(params.contribution)}
              </span>
              , horizonte <span className="font-semibold text-white">{params.horizon}</span> años,
              rendimiento <span className="font-semibold text-white">{formatPercentWithIndicator(params.yieldRate)}</span>{' '}
              e inflación <span className="font-semibold text-white">{formatPercentWithIndicator(params.inflation)}</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.4em] text-white/50">Simulador</span>
            <button
              type="button"
              onClick={onHandleSaveScenario}
              disabled={scenarioSaveStatus === 'saving'}
              className="rounded-full border border-emerald-500/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200 transition hover:bg-emerald-500/10 disabled:opacity-60 disabled:hover:bg-transparent"
            >
              {scenarioSaveStatus === 'saving' ? 'Guardando...' : 'Guardar escenario'}
            </button>
            {scenarioSaveMessage ? (
              <span className="text-xs text-emerald-200" role="status" aria-live="polite">
                {scenarioSaveMessage}
              </span>
            ) : null}
          </div>
        </div>
        <div className="mt-5 grid gap-4 rounded-3xl border border-white/5 bg-black/30 p-5 lg:grid-cols-[1fr,1fr] lg:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Ingreso mensual</p>
            <p className="text-3xl font-semibold text-white">{formatCurrencyWithIndicator(params.income)}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/70">
              <span>
                Ahorrando <span className="font-semibold text-white">{formatPercentWithIndicator(savingPercent)}</span>
              </span>
              <span className={`rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.3em] ${savingPalette.badge}`}>
                {savingStatus}
              </span>
            </div>
          </div>
          <div className={`rounded-2xl border px-4 py-3 text-sm ${savingPalette.messageBox}`}>
            <p className="font-semibold text-white">{savingMessage}</p>
            <p className="mt-1 text-white/70">{targetStatement}</p>
          </div>
        </div>
        <div className="mt-6 space-y-4 text-sm text-white/70">
          <RangeControl
            label="Ingreso mensual"
            info="Actualiza el flujo base para recalcular metas y aportes."
            min={8000}
            max={40000}
            value={params.income}
            onChange={onHandleSliderChange('income')}
            allowManualInput
            description="Ajusta tu flujo sin tocar los ahorros del patrimonio."
            trackColor={savingPalette.trackColor}
          />
          <RangeControl
            label="Aportación mensual"
            info="Monto destinado a inversiones o cuentas editables."
            min={1000}
            max={15000}
            value={params.contribution}
            onChange={onHandleSliderChange('contribution')}
            allowManualInput
            description="El monto extra se refleja directamente en las cuentas editables."
            trackColor="#22c55e"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <RangeControl
              label="Horizonte (años)"
              info="Cuántos años proyectas para el crecimiento compuesto."
              min={5}
              max={30}
              value={params.horizon}
              onChange={onHandleSliderChange('horizon')}
              unit=" años"
              allowManualInput
              description="Más años permiten capitalizar con efecto compuesto."
            />
            <RangeControl
              label="Rendimiento anual ETFs"
              info="Tasa estimada de los ETFs considerados en la estrategia."
              min={4}
              max={15}
              step={0.5}
              value={params.yieldRate}
              onChange={onHandleSliderChange('yieldRate')}
              unit="%"
              allowManualInput
              description="Perspectiva realista basada en ETFs conservadores."
            />
          </div>
          <RangeControl
            label="Inflación anual (MXN)"
            info="Factor usado para convertir capital nominal a real."
            min={1}
            max={10}
            step={0.1}
            value={params.inflation}
            onChange={onHandleSliderChange('inflation')}
            unit="%"
            allowManualInput
            description="Permite ver cuánto pierde poder adquisitivo tu capital."
          />
        </div>
      </article>
    </div>
  </section>
);

export default OverviewAndSimulatorSection;
