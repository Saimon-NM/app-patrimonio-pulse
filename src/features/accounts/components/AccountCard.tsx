import { memo, type ChangeEvent } from 'react';
import type { Account } from '@/features/accounts/model/provider.types';
import {
  formatCurrencyWithIndicator,
  formatPercentWithIndicator,
} from '@/shared/utils/precision';
import InfoIcon from '@/shared/components/InfoIcon';
import Badge from '@/shared/components/ui/Badge';

type AccountField = 'balance' | 'rate';

interface AccountCardProps {
  providerId: string;
  account: Account;
  onAccountChange: (providerId: string, accountId: string, field: AccountField, value: number) => void;
  onAccountMetaChange?: (providerId: string, accountId: string, updates: Partial<Account>) => void;
  onRemoveAccount?: (providerId: string, accountId: string) => void;
  highlightColor: string;
  etfYieldRate: number;
}

const AccountCard = ({
  providerId,
  account,
  onAccountChange,
  onAccountMetaChange,
  onRemoveAccount,
  highlightColor,
  etfYieldRate,
}: AccountCardProps) => {
  const hasMaxLimit = account.maxBalance !== undefined && Number.isFinite(account.maxBalance);

  const handleBalanceChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.trim() === '') {
      return;
    }
    const value = Number(event.target.value);
    onAccountChange(providerId, account.id, 'balance', Number.isNaN(value) ? 0 : value);
  };

  const handleRateChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.trim() === '') {
      return;
    }
    const value = Number(event.target.value);
    onAccountChange(providerId, account.id, 'rate', Number.isNaN(value) ? 0 : value);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    onAccountMetaChange?.(providerId, account.id, { name: event.target.value });
  };

  const handleDescChange = (event: ChangeEvent<HTMLInputElement>) => {
    onAccountMetaChange?.(providerId, account.id, { desc: event.target.value });
  };

  const handleUseEtfRate = () => {
    if (Number.isNaN(etfYieldRate) || etfYieldRate <= 0) {
      return;
    }
    onAccountChange(providerId, account.id, 'rate', etfYieldRate);
  };

  const accentColor = highlightColor || '#38bdf8';
  const matchesEtfRate = Math.abs(account.rate - etfYieldRate) < 1e-4;
  const etfRateLabel = matchesEtfRate
    ? 'Rendimiento ETFs aplicado'
    : `Usar rendimiento ETFs (${formatPercentWithIndicator(etfYieldRate)})`;

  return (
    <div className="w-full space-y-4 min-w-0">
        <div className="w-full min-w-0 rounded-2xl border border-white/15 bg-black/40 p-4 transition-shadow hover:shadow-white/10">
          <div className="flex min-w-0 flex-wrap items-start justify-start gap-4">
            <div className="min-w-0">
            {onAccountMetaChange ? (
              <>
                <div className="flex items-center gap-2">
                  <input
                    aria-label="Nombre de la cuenta"
                    value={account.name}
                    onChange={handleNameChange}
                    placeholder="Nombre editable"
                    className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-base font-semibold text-white placeholder-white/60 outline-none transition focus:border-cyan-400 focus:bg-white/10 focus:ring-1 focus:ring-cyan-400"
                  />
                  <InfoIcon label={`Cuenta ${account.name}: ${account.desc}`} />
                </div>
                <input
                  aria-label="Descripción de la cuenta"
                  value={account.desc}
                  onChange={handleDescChange}
                  placeholder="Describe la estrategia / objetivo"
                  className="mt-1 w-full min-w-0 rounded-2xl border border-white/10 bg-transparent px-3 py-1 text-sm text-white/60 placeholder-white/50 outline-none transition focus:border-cyan-400 focus:bg-white/5 focus:ring-1 focus:ring-cyan-400"
                />
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <p className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-base font-semibold text-white">
                    {account.name}
                  </p>
                  <InfoIcon label={`Cuenta ${account.name}: ${account.desc}`} />
                </div>
                <p className="text-xs text-white/60">{account.desc}</p>
              </>
            )}
          </div>
          <div className="text-right min-w-0">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/40 flex items-center gap-2">
              Saldo MXN
              <InfoIcon label="Saldo editable que se guarda automáticamente" />
            </p>
            <input
              aria-label={`${account.name} saldo`}
              type="number"
              step="100"
              value={account.balance}
              onChange={handleBalanceChange}
              className="mt-1 w-full max-w-36 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-right text-lg font-semibold text-white placeholder-white/60 transition focus:border-cyan-400 focus:bg-white/10 focus:ring-1 focus:ring-cyan-400"
            />
            <p className="text-[0.65rem] text-white/40">{formatCurrencyWithIndicator(account.balance)}</p>

            {onAccountMetaChange ? (
              <div className="mt-3 space-y-2">
                <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/40 flex items-center gap-2">
                  Máximo a meter
                  <InfoIcon label="Tope de dinero en esta posición. Si llegas al tope, no se recomienda aumentar aquí." />
                </p>
                <input
                  aria-label={`${account.name} máximo a meter`}
                  type="number"
                  step="100"
                  value={hasMaxLimit ? account.maxBalance : ''}
                  placeholder="sin limite"
                  onChange={(e) => {
                    const raw = e.target.value.trim();
                    const next = raw === '' ? undefined : Number(raw);
                    onAccountMetaChange?.(providerId, account.id, {
                      maxBalance: next === undefined || !Number.isFinite(next) ? undefined : Math.max(0, next),
                    });
                  }}
                  className={`w-full max-w-36 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-right text-base font-semibold transition placeholder:font-semibold placeholder:uppercase placeholder:tracking-[0.05em] placeholder:text-emerald-300/70 focus:border-cyan-400 focus:bg-white/10 focus:ring-1 focus:ring-cyan-400 ${
                    hasMaxLimit ? 'text-white placeholder:text-white/60' : 'text-emerald-200'
                  }`}
                />
                <div className="flex items-center justify-end gap-2">
                  {hasMaxLimit ? (
                    <button
                      type="button"
                      onClick={() => onAccountMetaChange?.(providerId, account.id, { maxBalance: undefined })}
                      className="rounded-full border border-white/20 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-white/40 hover:text-white"
                    >
                      Sin tope
                    </button>
                  ) : null}
                </div>

                <label
                  className={`flex items-center justify-between gap-2 rounded-2xl border px-3 py-2 text-[0.65rem] uppercase tracking-[0.3em] transition ${
                    (account.includeInRecommendations ?? true)
                      ? 'border-emerald-300/40 bg-emerald-500/10 text-emerald-200/90'
                      : 'border-white/15 bg-white/5 text-white/50 hover:border-white/25'
                  }`}
                >
                  <input
                    type="checkbox"
                    aria-label="Incluir esta posición en recomendaciones"
                    checked={account.includeInRecommendations ?? true}
                    onChange={(e) =>
                      onAccountMetaChange?.(providerId, account.id, {
                        includeInRecommendations: e.target.checked,
                      })
                    }
                    className="peer h-4 w-4 rounded border border-white/25 bg-white/5 accent-emerald-300 focus:ring-1 focus:ring-emerald-300/60"
                  />
                  <span className="ml-2">Incluir en recs</span>
                </label>
              </div>
            ) : null}
          </div>
          {onRemoveAccount && (
            <div className="flex flex-col items-end justify-between text-right">
              <button
                type="button"
                onClick={() => onRemoveAccount(providerId, account.id)}
                className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-300 transition hover:text-rose-100"
              >
                Eliminar
              </button>
              <p className="text-[0.65rem] text-white/40">Quita esta posición</p>
            </div>
          )}
        </div>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 min-w-0">
          <label className="col-span-2 flex min-w-0 flex-col gap-1 sm:col-span-2">
            <span className="flex items-center gap-1 text-[0.7rem] uppercase tracking-[0.3em] text-white/50">
              % anual
              <InfoIcon label="Tasa efectiva anual que estás obteniendo" />
            </span>
            <input
              aria-label={`${account.name} tasa anual`}
              type="number"
              step="0.1"
              value={account.rate}
              onChange={handleRateChange}
              className="rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-right font-semibold text-white focus:border-white/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleUseEtfRate}
              disabled={matchesEtfRate}
              className="mt-2 w-full rounded-2xl border border-white/20 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-cyan-300 transition hover:border-cyan-300 hover:text-white disabled:border-white/10 disabled:text-white/40 whitespace-normal break-words"
            >
              {etfRateLabel}
            </button>
          </label>
          <div className="col-span-2 flex min-w-0 flex-col gap-1 text-right sm:col-span-2">
            <span className="flex items-center justify-end gap-1 text-[0.7rem] uppercase tracking-[0.3em] text-white/50">
              + / mes estimado
              <InfoIcon label="Estimación de ganancia mensual limpia" />
            </span>
            <Badge
              className="self-end rounded-2xl bg-white/5 px-3 py-2 text-sm"
              textColor={accentColor}
              borderColor={`${accentColor}40`}
              dotColor={accentColor}
            >
              {formatCurrencyWithIndicator(account.monthly)}
            </Badge>
            <p className="text-xs text-white/50">Impacto actual · Calculado con saldo · tasa / 12</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(AccountCard);
