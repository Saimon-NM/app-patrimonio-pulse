import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FC, KeyboardEvent } from 'react';
import InfoIcon from './InfoIcon';
import { formatNumberWithIndicator } from '@/shared/utils/precision';

export interface RangeControlProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  unit?: string;
  allowManualInput?: boolean;
  /** Valor de referencia para marcar en el slider (solo informativo) */
  markerValue?: number;
  markerLabel?: string;
  description?: string;
  info?: string;
  onChange: (value: number) => void;
  trackColor?: string;
}

const RangeControl: FC<RangeControlProps> = ({
  label,
  min,
  max,
  step = 1,
  value,
  unit,
  allowManualInput = false,
  markerValue,
  markerLabel,
  description,
  info,
  onChange,
  trackColor,
}) => {
  const [draft, setDraft] = useState<string>(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const parseAndCommit = () => {
    const raw = draft.trim().replace(',', '.');
    if (!raw) {
      setDraft(String(value));
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      setDraft(String(value));
      return;
    }
    const clamped = Math.min(max, Math.max(min, n));
    onChange(clamped);
  };

  const percentage = useMemo(() => {
    if (max <= min) return 0;
    return ((value - min) / (max - min)) * 100;
  }, [value, min, max]);

  const markerPercentage = useMemo(() => {
    if (markerValue == null || max <= min) return null;
    // Alineamos la marquita al mismo "ritmo" que el slider (step), para que visualmente
    // coincida incluso si la referencia viene con decimales (ej: 3.999 -> 4.0).
    const stepStr = String(step);
    const decimals = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
    const factor = 10 ** decimals;
    const markerOnStep = Math.round(markerValue * factor) / factor;

    const raw = ((markerOnStep - min) / (max - min)) * 100;
    return Math.min(100, Math.max(0, raw));
  }, [markerValue, min, max, step]);

  const displayValue = unit
    ? `${formatNumberWithIndicator(value)} ${unit}`
    : formatNumberWithIndicator(value);

  return (
    <label className="block">
      <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-white/60">
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {info && <InfoIcon label={info} />}
        </div>
        {allowManualInput ? (
          <div className="flex items-center gap-2">
            <input
              aria-label={`${label} valor exacto`}
              type="text"
              inputMode="decimal"
              value={draft}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
              onBlur={parseAndCommit}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') parseAndCommit();
              }}
              className="w-24 rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-right font-semibold text-white placeholder-white/40 outline-none focus:border-cyan-400 focus:bg-white/10 focus:ring-1 focus:ring-cyan-400"
            />
            {unit ? <span className="text-white/50">{unit}</span> : null}
          </div>
        ) : (
          <span aria-live="polite">{displayValue}</span>
        )}
      </div>
      {description && <p className="text-[0.75rem] text-white/50">{description}</p>}
      <input
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(Number(event.target.value))}
        className="range-control mt-2 w-full appearance-none rounded-full focus-visible:outline-none"
        style={{
          background: `linear-gradient(90deg, ${trackColor ?? 'var(--accent-blue)'} ${percentage}%, rgba(255,255,255,0.15) ${percentage}%)`,
        }}
      />
      {markerPercentage == null ? null : (
        <div className="relative w-full -mt-[0.65rem]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0"
            style={{ left: `${markerPercentage}%`, transform: 'translateX(-50%)' }}
          >
            <div className="h-7 w-[2px] rounded-full bg-amber-300/90" />
            {markerLabel ? (
              <div className="mt-0.5 whitespace-nowrap text-[0.52rem] font-semibold text-amber-200">
                {markerLabel}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </label>
  );
};

export default RangeControl;
