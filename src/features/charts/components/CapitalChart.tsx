import { memo, useCallback, useState } from 'react';
import type { FC } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartContainer from '@/shared/components/ui/ChartContainer';
import { labelClass } from '@/shared/styles/tokens';
import { formatCurrencyWithIndicator, formatShortCurrency } from '@/shared/utils/precision';
import type { GoalConfig } from '@/features/settings/types/settings.types';
import type { ProjectionPoint } from '@/features/projections/model/projection.types';
import {
  DEFAULT_GOAL_COLORS,
  useCapitalChartSeries,
  type FocusMode,
} from '@/features/charts/hooks/useCapitalChartSeries';

interface CapitalChartProps {
  data: ProjectionPoint[];
  baselineData: ProjectionPoint[];
  goals: Array<GoalConfig & { color?: string }>;
  activeGoalId: string;
  currentCapital: number;
}

const focusOptions: Array<{ value: FocusMode; label: string }> = [
  { value: 'nominal', label: 'Nominal' },
  { value: 'real', label: 'Real' },
];

const CapitalChart: FC<CapitalChartProps> = ({
  data,
  baselineData,
  goals,
  activeGoalId,
  currentCapital,
}) => {
  const [focus, setFocus] = useState<FocusMode>('nominal');
  const secondaryFocus = focus === 'nominal' ? 'real' : 'nominal';

  const { axisMax, mergedData, legendEntries, activeGoal } = useCapitalChartSeries({
    data,
    baselineData,
    goals,
    currentCapital,
    activeGoalId,
    focus,
    secondaryFocus,
  });

  const tooltipContent = useCallback(
    ({ active, payload, label }: { active?: boolean; payload?: readonly any[]; label?: number | string }) => {
      if (!active || !payload?.length || label == null) {
        return null;
      }

      const entries = payload.reduce<Record<string, any>>((acc: Record<string, any>, entry: any) => {
        if (entry?.dataKey) {
          acc[entry.dataKey] = entry;
        }
        return acc;
      }, {});

      const orderedEntries = [entries[focus], entries[secondaryFocus], entries.baselineNominal].filter(Boolean);

      return (
        <div className="rounded-2xl bg-black/90 p-3 text-xs text-white shadow-xl">
          <p className="text-white/70">Año {label}</p>
          {orderedEntries.map((entry) => (
            <div key={`${entry.dataKey}-${label}`} className="mt-2 flex items-center justify-between gap-4">
              <span className="text-[0.6rem] uppercase tracking-[0.3em] text-white/40">{entry.name}</span>
              <span className="text-sm font-semibold text-white">
                {formatCurrencyWithIndicator(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    },
    [focus, secondaryFocus]
  );

  const focusButtons = (
    <div className="flex gap-2">
      {focusOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setFocus(option.value)}
          className={
            focus === option.value
              ? 'rounded-full border border-sky-400/80 bg-sky-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white transition'
              : 'rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition'
          }
          aria-pressed={focus === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  const lastPoint = mergedData[mergedData.length - 1];

  return (
    <ChartContainer
      title="Proyección al horizonte"
      description="Capital nominal, real y el escenario sin aportes para comparar progreso."
      legendEntries={legendEntries}
      headerActions={focusButtons}
    >
      <div className="flex shrink-0 items-center justify-between gap-4 text-xs uppercase tracking-[0.3em] text-white/60">
        <span>Capital acumulado</span>
        <span className="text-white/70">{formatShortCurrency(axisMax)}</span>
      </div>

      <ResponsiveContainer width="100%" height="100%" className="mt-4 min-h-[256px] flex-1">
          <LineChart data={mergedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis
              dataKey="year"
              tick={{ fill: '#cbd5f5', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            />
            <YAxis
              tick={{ fill: '#cbd5f5', fontSize: 12 }}
              tickFormatter={formatShortCurrency}
              domain={[0, axisMax]}
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            />
            <Tooltip content={tooltipContent} />
            {goals.map((goalItem, index) => {
              if (!goalItem.amount || !Number.isFinite(goalItem.amount)) {
                return null;
              }

              const lineColor = goalItem.color ?? DEFAULT_GOAL_COLORS[index % DEFAULT_GOAL_COLORS.length];
              return (
                <ReferenceLine
                  key={goalItem.id}
                  y={goalItem.amount}
                  stroke={lineColor}
                  strokeDasharray={goalItem.id === activeGoalId ? undefined : '4 4'}
                  strokeWidth={goalItem.id === activeGoalId ? 3 : 1.5}
                  label={{
                    position: 'top',
                    value: goalItem.title,
                    fill: lineColor,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
              );
            })}
            {lastPoint ? (
              <ReferenceDot
                x={lastPoint.year}
                y={lastPoint[focus]}
                r={6}
                fill="#fcd34d"
                stroke="#f97316"
                strokeWidth={2}
              />
            ) : null}
            <Line
              type="monotone"
              dataKey={focus}
              name={`Invirtiendo (${focus === 'nominal' ? 'nominal' : 'real'})`}
              stroke={focus === 'nominal' ? '#2d86f3' : '#e0ad3b'}
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey={secondaryFocus}
              name={`Invirtiendo (${secondaryFocus})`}
              stroke={secondaryFocus === 'nominal' ? '#2d86f3' : '#e0ad3b'}
              strokeWidth={2}
              dot={false}
              strokeDasharray="6 6"
              opacity={0.7}
            />
            <Line
              type="monotone"
              dataKey="baselineNominal"
              name="Sin invertir"
              stroke="#9ca3af"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 4"
            />
          </LineChart>
        </ResponsiveContainer>

      <div className="mt-4 shrink-0 flex flex-col gap-1 text-sm text-white/70">
        <span className={labelClass}>Cálculo</span>
        <p>
          La línea azul representa capital + aportes con rendimiento; la dorada ajusta ese flujo por inflación; la gris
          punteada muestra qué pasa si mantienes solo el capital inicial.
        </p>
        <p className="font-semibold text-white">
          Actual: {formatCurrencyWithIndicator(currentCapital)} · {activeGoal?.title ?? 'Meta'}:{' '}
          {formatCurrencyWithIndicator(activeGoal?.amount ?? 0)}
        </p>
      </div>
    </ChartContainer>
  );
};

export default memo(CapitalChart);
