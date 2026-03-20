import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { BalanceSnapshot } from '@/features/portfolio/services/balanceHistoryService';
import ChartContainer from '@/shared/components/ui/ChartContainer';
import { formatCurrencyWithIndicator } from '@/shared/utils/precision';

type BalanceHistoryPanelProps = {
  history: BalanceSnapshot[];
  currentBalance: number;
  onRegisterSnapshot: () => void;
  onClearHistory: () => void;
  onRemoveSnapshot: (id: string) => void;
};

const formatDateShort = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
};

const formatDateTimeShort = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const HistoryTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: unknown; name?: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;

  const totalBalance = payload.find((p) => p.name === 'Capital')?.value;
  const monthlyPassive = payload.find((p) => p.name === 'Ingreso mensual')?.value;
  const balanceNumber = typeof totalBalance === 'number' ? totalBalance : Number(totalBalance);
  const monthlyNumber = typeof monthlyPassive === 'number' ? monthlyPassive : Number(monthlyPassive);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/90 px-3 py-2 text-xs text-white shadow-2xl">
      <p className="text-white/70">{typeof label === 'string' ? formatDateTimeShort(label) : ''}</p>
      <div className="mt-1 space-y-1">
        <p>
          Capital: <span className="font-semibold">{formatCurrencyWithIndicator(balanceNumber)}</span>
        </p>
        <p>
          Ingreso mensual: <span className="font-semibold">{formatCurrencyWithIndicator(monthlyNumber)}</span>
        </p>
      </div>
    </div>
  );
};

const BalanceHistoryPanel = ({
  history,
  currentBalance,
  onRegisterSnapshot,
  onClearHistory,
  onRemoveSnapshot,
}: BalanceHistoryPanelProps) => {
  const chartData = useMemo(
    () =>
      history.map((h) => ({
        recordedAt: h.recordedAt,
        capital: h.totalBalance,
        monthlyPassive: h.monthlyPassive,
      })),
    [history]
  );

  const latest = history.length ? history[history.length - 1] : null;
  const latestMonthly = latest?.monthlyPassive ?? 0;
  const chartMinHeightClass = history.length ? 'min-h-[420px]' : 'min-h-[300px]';

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Historial</p>
          <h2 className="text-lg font-semibold text-white">Historial de saldos</h2>
          <p className="mt-1 text-sm text-white/60">
            {history.length
              ? `Último snapshot: ${formatDateTimeShort(latest!.recordedAt)}.`
              : 'Registra tu primer snapshot para ver la evolución.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRegisterSnapshot}
            className="rounded-full border border-emerald-500/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200 transition hover:bg-emerald-500/10"
          >
            Registrar snapshot
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Borrar todo el historial de saldos?')) {
                onClearHistory();
              }
            }}
            className="rounded-full border border-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-white/30"
          >
            Limpiar
          </button>
        </div>
      </div>

      <ChartContainer
        title="Evolución de capital"
        description="Resumen de capital total a lo largo del tiempo."
        className={chartMinHeightClass}
      >
        {history.length ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 10, right: 16, left: 8, bottom: 10 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="recordedAt" tickFormatter={(v) => formatDateShort(String(v))} />
                  <YAxis tickFormatter={(v) => `${formatCurrencyWithIndicator(v).replace('MXN', '').trim()}`} />
                  <Tooltip content={<HistoryTooltip />} />
                  <Line type="monotone" dataKey="capital" name="Capital" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Line
                    type="monotone"
                    dataKey="monthlyPassive"
                    name="Ingreso mensual"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={false}
                    yAxisId={0}
                    opacity={0.85}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.4em] text-white/40">Capital actual</p>
                <p className="mt-2 text-xl font-semibold text-white">{formatCurrencyWithIndicator(currentBalance)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.4em] text-white/40">Ingreso mensual (último)</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {formatCurrencyWithIndicator(latestMonthly)}
                </p>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-white/10 text-white/60">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                    <th className="px-4 py-3 font-semibold">Capital</th>
                    <th className="px-4 py-3 font-semibold">Ingreso mensual</th>
                    <th className="px-4 py-3 font-semibold">Acción</th>
                  </tr>
                </thead>
                <tbody className="text-white/80">
                  {history
                    .slice()
                    .reverse()
                    .slice(0, 10)
                    .map((h) => (
                      <tr key={h.id} className="border-b border-white/5 last:border-b-0">
                        <td className="px-4 py-3">{formatDateTimeShort(h.recordedAt)}</td>
                        <td className="px-4 py-3">{formatCurrencyWithIndicator(h.totalBalance)}</td>
                        <td className="px-4 py-3">{formatCurrencyWithIndicator(h.monthlyPassive)}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('¿Eliminar este snapshot?')) {
                                onRemoveSnapshot(h.id);
                              }
                            }}
                            className="rounded-full border border-red-500 px-3 py-1 text-xs text-red-400 transition hover:bg-red-500/10"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-white/60">Todavía no hay snapshots. Haz clic en “Registrar snapshot”.</p>
          </div>
        )}
      </ChartContainer>
    </section>
  );
};

export default BalanceHistoryPanel;

