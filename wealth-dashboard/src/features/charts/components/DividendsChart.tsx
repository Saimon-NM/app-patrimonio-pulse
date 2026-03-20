import { memo, useMemo, useState } from 'react';
import type { FC } from 'react';
import {
  AreaChart,
  Area,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import InfoIcon from '@/shared/components/InfoIcon';
import { labelClass } from '@/shared/styles/tokens';
import { formatCurrencyWithIndicator, formatShortCurrency } from '@/shared/utils/precision';
import type { DividendRecord } from '@/features/projections/model/projection.types';

interface DividendsChartProps {
  dividendRecords: DividendRecord[];
  passiveMonthlyEstimate: number;
  currentCapital: number;
}

type DividendMode = 'mensual' | 'acumulado';
const MAX_CHART_POINTS = 180;

const downsampleDividendRecords = (records: DividendRecord[], maxPoints = MAX_CHART_POINTS) => {
  if (records.length <= maxPoints) return records;
  const stride = (records.length - 1) / (maxPoints - 1);
  const sampled: DividendRecord[] = [];
  for (let i = 0; i < maxPoints; i += 1) {
    const idx = Math.round(i * stride);
    sampled.push(records[idx]);
  }
  return sampled;
};

const LegendRow = ({ color, label, description }: { color: string; label: string; description: string }) => (
  <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/70">
    <span className="mt-0.5 h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
    <div>
      <p className="font-semibold text-white">{label}</p>
      <p className="text-[0.65rem] text-white/60">{description}</p>
    </div>
  </div>
);

type TooltipPayload = { active?: boolean; label?: string | number };

const tooltipContentFactory = (
  datasetByYear: Map<number, DividendRecord>,
  selectedKey: 'mensual' | 'acumulado'
) => {
  return ({ active, label }: TooltipPayload) => {
    if (!active || label == null) return null;
    const record = datasetByYear.get(Number(label));
    if (!record) return null;

    return (
      <div className="w-64 rounded-2xl bg-black/90 p-3 text-xs text-white shadow-xl">
        <p className="text-white/70">Año {record.year}</p>
        <div className="mt-2 flex items-center justify-between gap-4">
          <span className="text-[0.6rem] uppercase tracking-[0.3em] text-white/40">
            {selectedKey === 'mensual' ? 'Flujo mensual' : 'Total acumulado'}
          </span>
          <span className="text-sm font-semibold text-white">{formatCurrencyWithIndicator(record[selectedKey])}</span>
        </div>
        <div className="mt-3 border-t border-white/10 pt-2">
          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-white/40">Total anual</p>
          <p className="text-sm font-semibold text-white">{formatCurrencyWithIndicator(record.anual)}</p>
        </div>
        <div className="mt-3 text-[0.65rem] text-white/60">
          <p className="mb-1">Desglose mensual</p>
          <ul className="space-y-0.5 text-[0.7rem] text-white/70">
            {record.monthlyBreakdown.map((value: number, idx: number) => (
              <li key={idx} className="flex justify-between">
                <span>Mes {idx + 1}</span>
                <span>{formatCurrencyWithIndicator(value)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };
};

const DividendsChart: FC<DividendsChartProps> = ({ dividendRecords, passiveMonthlyEstimate, currentCapital }) => {
  const [mode, setMode] = useState<DividendMode>('mensual');

  const firstRecord = dividendRecords[0];
  const finalRecord = dividendRecords[dividendRecords.length - 1];
  const firstProjected = firstRecord?.mensual ?? passiveMonthlyEstimate;
  const finalProjected = finalRecord?.mensual ?? firstProjected;
  const formatPercent = (value: number) =>
    `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  const growthFromCurrent =
    passiveMonthlyEstimate > 0 ? ((firstProjected - passiveMonthlyEstimate) / passiveMonthlyEstimate) * 100 : 0;
  const growthUntilHorizon =
    passiveMonthlyEstimate > 0 ? ((finalProjected - passiveMonthlyEstimate) / passiveMonthlyEstimate) * 100 : 0;

  const datasetByYear = useMemo(() => {
    const map = new Map<number, DividendRecord>();
    dividendRecords.forEach((record) => map.set(record.year, record));
    return map;
  }, [dividendRecords]);
  const chartData = useMemo(() => downsampleDividendRecords(dividendRecords), [dividendRecords]);

  const selectedKey = mode === 'mensual' ? 'mensual' : 'acumulado';
  const selectedLabel = mode === 'mensual' ? 'Mensual' : 'Acumulado';
  const tooltipContent = useMemo(
    () => tooltipContentFactory(datasetByYear, selectedKey),
    [datasetByYear, selectedKey]
  );

  const axisMax = useMemo(() => {
    const values = chartData.map((record) => record[selectedKey]);
    const base = values.length ? Math.max(...values, passiveMonthlyEstimate) : passiveMonthlyEstimate;
    if (!Number.isFinite(base) || base <= 0) {
      return 10000;
    }
    return Math.ceil(base / 10000) * 10000;
  }, [chartData, passiveMonthlyEstimate, selectedKey]);

  const legendItems = useMemo(
    () => (
      <>
        <LegendRow
          color="#22c55e"
          label="Proyección mensual"
          description="Dividendos por capital nominal proyectado."
        />
        <LegendRow
          color="#34d399"
          label="Flujo actual"
          description="Capital + aportes actuales con tu rendimiento promedio."
        />
      </>
    ),
    []
  );

  return (
    <div className="glass flex min-h-[400px] flex-col rounded-3xl border border-white/10 p-6 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">Dividendos mensuales proyectados</h2>
          <InfoIcon label="Desglosa el flujo mensual a partir del capital y las tasas que has ingresado." />
        </div>
        <div className="flex gap-2">
          {(['mensual', 'acumulado'] as DividendMode[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                mode === option
                  ? 'border border-emerald-400/80 bg-emerald-500/20 text-white'
                  : 'border border-white/20 bg-black/60 text-white/70'
              }`}
              aria-pressed={mode === option}
            >
              {option === 'mensual' ? 'Mensual' : 'Acumulado'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-3 text-xs text-white/70 sm:grid-cols-2">{legendItems}</div>

      <div className="mt-3 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.3em] text-white/60">
        <span>{mode === 'mensual' ? 'Flujo mensual proyectado' : 'Acumulado total'}</span>
        <span className="text-white/70">{formatShortCurrency(axisMax)}</span>
      </div>

      <ResponsiveContainer width="100%" height="100%" className="mt-4 min-h-[256px] flex-1">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis
              dataKey="year"
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              tick={{ fill: '#cbd5f5', fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#cbd5f5', fontSize: 12 }}
              tickFormatter={formatShortCurrency}
              domain={[0, axisMax]}
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            />
            <Tooltip content={tooltipContent} />
            <ReferenceLine
              y={passiveMonthlyEstimate}
              stroke="#34d399"
              strokeDasharray="4 4"
              label={{
                value: 'Flujo actual',
                position: 'top',
                fill: '#6ee7b7',
                fontWeight: 600,
                fontSize: 11,
              }}
            />
            <defs>
              <linearGradient id="dividendGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={selectedKey}
              name={selectedLabel}
              stroke="#22c55e"
              fill="url(#dividendGradient)"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey={selectedKey}
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 0 }}
              opacity={0.9}
            />
            {chartData.length > 0 && (
              <ReferenceDot
                x={chartData[chartData.length - 1].year}
                y={chartData[chartData.length - 1][selectedKey]}
                r={5}
                fill="#34d399"
                stroke="#10b981"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>

      <div className="mt-4 space-y-3 text-sm text-white/70">
        <div className={`flex items-center justify-between ${labelClass}`}>
          <span>Cálculo</span>
          <span className="text-emerald-200">Valores dinámicos</span>
        </div>
        <p className="text-base text-white">
          Cada punto suma los dividendos mensuales calculados durante los 12 meses del año y los divide por 12 para mostrar el flujo promedio; el modo “Acumulado” suma esos años para mostrar el impacto de tus aportes.
        </p>
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-[0.8rem] text-amber-100 shadow-sm">
          <p className="font-semibold text-amber-200">Nota aclaratoria</p>
          <p>
            El total anual considera el capital actual más los aportes mensuales programados. Por eso puede ser mayor que el flujo actual sin nuevos aportes; esa cifra se muestra abajo como referencia (“Capital base”).
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-[0.8rem] text-emerald-100 shadow-sm">
          <p className="font-semibold text-emerald-200">Flujo proyectado</p>
          <p>
            Año 1: {formatCurrencyWithIndicator(firstProjected)} ({formatPercent(growthFromCurrent)} vs flujo actual).
          </p>
          <p>
            Horizonte completo: {formatCurrencyWithIndicator(finalProjected)} ({formatPercent(growthUntilHorizon)} de crecimiento compuesto).
          </p>
          <p className="text-[0.72rem] text-emerald-50/70 mt-1">
            El “flujo actual” abajo todavía aparece plano porque no suma las nuevas aportaciones ni el interés compuesto futuro; lo usamos como base de comparación contra la proyección que sí sube.
          </p>
        </div>
        <p className="text-lg font-semibold text-white">
          Capital base: {formatCurrencyWithIndicator(currentCapital)} · Flujo actual: {formatCurrencyWithIndicator(passiveMonthlyEstimate)}
        </p>
      </div>
    </div>
  );
};

export default memo(DividendsChart);
