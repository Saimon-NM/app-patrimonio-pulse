import type { FC } from 'react';
import InfoIcon from '@/shared/components/InfoIcon';
import { formatCurrencyWithIndicator } from '@/shared/utils/precision';
import Card from '@/shared/components/ui/Card';
import type { SummarySnapshot } from '@/features/overview/data/summary.data';

export interface SummaryStatRow {
  label: string;
  value: string;
  info: string;
}

interface SummaryStatsProps {
  summary: SummarySnapshot;
  stats: SummaryStatRow[];
}

const SummaryStats: FC<SummaryStatsProps> = ({ summary, stats }) => (
  <Card as="section" label="Datos visibles" className="cursor-default flex flex-col gap-5">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/40">Datos visibles</p>
        <h2 className="text-lg font-semibold text-white">Resumen generado</h2>
      </div>
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-white/40">
        <span>Editar resumen</span>
        <InfoIcon label="Estos valores se calculan automáticamente con tus datos" />
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      {stats.map((item) => (
        <div
          key={item.label}
          className="flex flex-col rounded-2xl border border-white/10 bg-black/30 p-4"
        >
          <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.4em] text-white/50">
            <span>{item.label}</span>
            <InfoIcon label={item.info} />
          </div>
          <p className="text-2xl font-semibold text-white mt-3">{item.value}</p>
        </div>
      ))}
    </div>
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-[0.8rem] text-white/70">
      <p className="font-semibold text-white">Capital consolidado</p>
      <p>
        {formatCurrencyWithIndicator(summary.total)} en capital total y{' '}
        {formatCurrencyWithIndicator(summary.monthlyPassive)} de ingreso pasivo mensual estimado.
      </p>
    </div>
  </Card>
);

export default SummaryStats;
