import type { FC } from 'react';
import Badge from '@/shared/components/ui/Badge';
import type { SimulationPreset } from '@/features/controls/data/simulationPresets';
import { formatCurrencyWithIndicator } from '@/shared/utils/precision';

interface SimulationPanelProps {
  presets: SimulationPreset[];
  activePresetId: string | null;
  onSelectPreset: (presetId: string | null) => void;
  summary: { monthlyPassive: number; annualPassive: number };
  simulated: { monthlyPassive: number; annualPassive: number };
}

const SimulationPanel: FC<SimulationPanelProps> = ({
  presets,
  activePresetId,
  onSelectPreset,
  summary,
  simulated,
}) => {
  const selectedPreset = presets.find((preset) => preset.id === activePresetId);
  if (!presets.length) {
    return null;
  }

  const diffMonthly = simulated.monthlyPassive - summary.monthlyPassive;
  const diffAnnual = simulated.annualPassive - summary.annualPassive;

  return (
    <div className="glass rounded-3xl border border-white/10 p-5 shadow-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/60">Simulador “qué pasaría si…”</p>
          <h3 className="text-lg font-semibold text-white">
            {selectedPreset ? selectedPreset.label : 'Elige un preset'}
          </h3>
          <p className="text-xs text-white/60">{selectedPreset?.description ?? 'Activa un escenario para ver diferencias.'}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em]">
          <button
            type="button"
            onClick={() => onSelectPreset(null)}
            className="rounded-full border border-white/30 px-4 py-1 text-white/60 transition hover:border-white/70 hover:text-white"
          >
            Reiniciar
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectPreset(preset.id)}
            className={`flex-1 rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition sm:flex-initial ${
              activePresetId === preset.id ? 'border-white/80 bg-white/10 text-white' : 'border-white/30 bg-black/40 text-white/60'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-white">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/50">Ingreso pasivo / mes</p>
          <p className="text-2xl font-semibold text-white">{formatCurrencyWithIndicator(summary.monthlyPassive)}</p>
          <p className="text-sm text-white/60">Actual</p>
          <p className="text-sm text-white/60">Simulado: {formatCurrencyWithIndicator(simulated.monthlyPassive)}</p>
          <Badge
            className="mt-2 rounded-full bg-white/5 px-3 py-1 text-xs"
            textColor={diffMonthly >= 0 ? '#34d399' : '#f87171'}
            borderColor={`${diffMonthly >= 0 ? '#34d399' : '#f87171'}40`}
            dotColor={diffMonthly >= 0 ? '#34d399' : '#f87171'}
          >
            {diffMonthly >= 0 ? '+' : ''}
            {formatCurrencyWithIndicator(Math.abs(diffMonthly))} mensual
          </Badge>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-white">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/50">Ingreso pasivo / año</p>
          <p className="text-2xl font-semibold text-white">{formatCurrencyWithIndicator(summary.annualPassive)}</p>
          <p className="text-sm text-white/60">Actual</p>
          <p className="text-sm text-white/60">Simulado: {formatCurrencyWithIndicator(simulated.annualPassive)}</p>
          <Badge
            className="mt-2 rounded-full bg-white/5 px-3 py-1 text-xs"
            textColor={diffAnnual >= 0 ? '#34d399' : '#f87171'}
            borderColor={`${diffAnnual >= 0 ? '#34d399' : '#f87171'}40`}
            dotColor={diffAnnual >= 0 ? '#34d399' : '#f87171'}
          >
            {diffAnnual >= 0 ? '+' : ''}
            {formatCurrencyWithIndicator(Math.abs(diffAnnual))} anual
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default SimulationPanel;
