import type { FC } from 'react';
import type { Provider } from '@/features/accounts/model/provider.types';
import { useReallocationRecommendations } from '@/features/insights/hooks/useReallocationRecommendations';
import { formatCurrencyWithIndicator, formatPercentWithIndicator } from '@/shared/utils/precision';
import InfoIcon from '@/shared/components/InfoIcon';

interface ReallocationRecommendationsPanelProps {
  providers: Provider[];
}

const formatAccountLabel = (providerName: string, accountName: string) => `${providerName} · ${accountName}`;

const AccountLine: FC<{ label: string; balancePct: number; monthly: number; monthlyPct: number }> = ({
  label,
  balancePct,
  monthly,
  monthlyPct,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-white/80">{label}</p>
      <p className="text-xs text-white/60">{`${balancePct.toFixed(1)}% de tu saldo`}</p>
    </div>
    <div className="text-right">
      <p className="text-sm font-semibold text-white">{formatCurrencyWithIndicator(monthly)}</p>
      <p className="text-xs text-white/60">{`${formatPercentWithIndicator(monthlyPct)} del ingreso pasivo`}</p>
    </div>
  </div>
);

export default function ReallocationRecommendationsPanel({ providers }: ReallocationRecommendationsPanelProps) {
  const { topToIncrease, toReduce, scopedTotalMonthly, excludedCount, includedCount } =
    useReallocationRecommendations(providers);
  const hasIncrease = topToIncrease.length > 0;
  const hasReduce = toReduce.length > 0;

  const movePct = 0.3;
  const epsilon = 1e-9;

  const currentTotalMonthly = scopedTotalMonthly;

  const transferSuggestion =
    hasIncrease && hasReduce && currentTotalMonthly > 0
      ? (() => {
          // Destino: mejor posición con capacidad.
          const to = topToIncrease[0];
          // Origen: peor posición (menor rendimiento) para mover dinero fuera.
          const from = toReduce[0];

          const fromBalance = from.balance || 0;
          const toBalance = to.balance || 0;
          if (fromBalance <= 0) return null;

          const toReturnPerMxN =
            toBalance > 0 ? to.monthly / toBalance : to.rate > 0 ? to.rate / 1200 : 0;
          const fromReturnPerMxN =
            fromBalance > 0
              ? from.monthly / fromBalance
              : from.rate > 0
                ? from.rate / 1200
                : 0;

          if (toReturnPerMxN <= fromReturnPerMxN + epsilon) return null;

          const capacity =
            to.maxBalance === undefined || !Number.isFinite(to.maxBalance)
              ? Number.POSITIVE_INFINITY
              : Math.max(0, to.maxBalance - toBalance);

          const rawMovedAmount = fromBalance * movePct;
          const movedAmount = Math.min(rawMovedAmount, capacity);
          if (movedAmount <= 0) return null;

          const newTotalMonthly =
            currentTotalMonthly - movedAmount * fromReturnPerMxN + movedAmount * toReturnPerMxN;
          const delta = newTotalMonthly - currentTotalMonthly;
          const percentChange = (delta / currentTotalMonthly) * 100;

          return {
            fromName: formatAccountLabel(from.providerName, from.accountName),
            toName: formatAccountLabel(to.providerName, to.accountName),
            currentTotalMonthly,
            newTotalMonthly,
            percentChange,
            rawMovedAmount,
            movedAmount,
            isCapped: movedAmount + 1e-6 < rawMovedAmount,
          };
        })()
      : null;

  if (!transferSuggestion && !hasIncrease && !hasReduce) return null;

  return (
    <div className="mt-4 rounded-3xl border border-white/10 bg-black/30 p-4 shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Recomendaciones</p>
            <InfoIcon label="Sugerencias basadas en rendimiento por peso (return/MXN). Solo se consideran posiciones con “Incluir en recs” activo." />
          </div>
          <h4 className="mt-1 text-lg font-semibold text-white">A dónde mover tu dinero</h4>
          {excludedCount > 0 ? (
            <p className="mt-1 text-xs text-white/50">
              Base: {includedCount} posiciones incluidas · {excludedCount} excluidas (checkbox desactivado)
            </p>
          ) : null}
          {transferSuggestion ? (
            <p className="mt-1 text-sm text-white/60">
              Para maximizar tu ingreso pasivo mensual, mueve el{' '}
              <span className="font-semibold text-white">{Math.round(movePct * 100)}%</span> del saldo de{' '}
              <span className="font-semibold text-white">{transferSuggestion.fromName}</span> hacia{' '}
              <span className="font-semibold text-white">{transferSuggestion.toName}</span> (≈{' '}
              <span className="font-semibold text-white">{formatCurrencyWithIndicator(transferSuggestion.rawMovedAmount)}</span>). Tu ingreso estimado pasa de{' '}
              <span className="font-semibold text-white">{formatCurrencyWithIndicator(transferSuggestion.currentTotalMonthly)}</span> a{' '}
              <span className="font-semibold text-white">{formatCurrencyWithIndicator(transferSuggestion.newTotalMonthly)}</span>{' '}
              ({transferSuggestion.percentChange >= 0 ? '+' : ''}
              {formatPercentWithIndicator(transferSuggestion.percentChange)}).
              {transferSuggestion.isCapped ? (
                <>
                  {' '}
                  <span className="text-white/60">(limitado por tu tope: efectivo ≈ </span>
                  <span className="font-semibold text-white">{formatCurrencyWithIndicator(transferSuggestion.movedAmount)}</span>
                  <span className="text-white/60">)</span>
                </>
              ) : null}
            </p>
          ) : !hasIncrease && hasReduce ? (
            <p className="mt-1 text-sm text-white/60">
              No hay posiciones con capacidad disponible (menos del tope) para aumentar con mejor rendimiento.
              Revisa los “Máximo a meter” en tus cuentas.
            </p>
          ) : (
            <p className="mt-1 text-sm text-white/60">
              Basado en el % de saldo y el ingreso pasivo mensual que genera cada cuenta.
            </p>
          )}
        </div>
      </div>

      {hasIncrease || hasReduce ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {hasIncrease ? (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Aumentar aportación</p>
              <div className="space-y-2">
                {topToIncrease.map((a) => (
                  <AccountLine
                    key={a.key}
                    label={formatAccountLabel(a.providerName, a.accountName)}
                    balancePct={a.balancePct}
                    monthly={a.monthly}
                    monthlyPct={a.monthlyPct}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {hasReduce ? (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Reducir/reequilibrar</p>
              <div className="space-y-2">
                {toReduce.map((a) => (
                  <AccountLine
                    key={a.key}
                    label={formatAccountLabel(a.providerName, a.accountName)}
                    balancePct={a.balancePct}
                    monthly={a.monthly}
                    monthlyPct={a.monthlyPct}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

