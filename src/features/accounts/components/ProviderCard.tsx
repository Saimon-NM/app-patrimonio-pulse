import { memo, useMemo } from 'react';
import type { FC } from 'react';
import type { Provider, Account } from '@/features/accounts/model/provider.types';
import AccountCard from './AccountCard';
import InfoIcon from '@/shared/components/InfoIcon';
import { formatPercentWithIndicator } from '@/shared/utils/precision';
import ColorPicker from '@/shared/components/ColorPicker';
import Badge from '@/shared/components/ui/Badge';
import { generateColorVariants } from '@/shared/utils/color';

type AccountField = 'balance' | 'rate';

interface ProviderCardProps {
  provider: Provider;
  onAccountChange: (providerId: string, accountId: string, field: AccountField, value: number) => void;
  onAccountMetaChange?: (providerId: string, accountId: string, updates: Partial<Account>) => void;
  onRemoveProvider?: (providerId: string) => void;
  onProviderUpdate?: (providerId: string, updates: Partial<Provider>) => void;
  onAddAccount?: (providerId: string) => void;
  onRemoveAccount?: (providerId: string, accountId: string) => void;
  onProviderColorChange?: (providerId: string, color: string) => void;
  etfYieldRate: number;
}

const ProviderCard: FC<ProviderCardProps> = ({
  provider,
  onAccountChange,
  onAccountMetaChange,
  onRemoveProvider,
  onProviderUpdate,
  onAddAccount,
  onRemoveAccount,
  onProviderColorChange,
  etfYieldRate,
}) => {
  const palette = useMemo(() => generateColorVariants(provider.accent), [provider.accent]);

  return (
    <article
      className={`glass flex min-h-[520px] flex-col gap-5 rounded-3xl border border-white/10 bg-[#090909] p-5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.6)] ${
        provider.isNew ? 'border-dashed border-amber-400/60 bg-black/20' : ''
      } overflow-hidden`}
    >
      <header className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              {onProviderUpdate ? (
                <input
                  aria-label="Nombre del proveedor"
                  placeholder="Edita el nombre del proveedor"
                  className="text-sm uppercase tracking-[0.4em] text-white/60 bg-white/5 px-3 py-1 rounded-2xl border border-white/15 text-white outline-none transition focus:border-cyan-400 focus:bg-white/10 focus:ring-1 focus:ring-cyan-400"
                  value={provider.name}
                  onChange={(event) => onProviderUpdate?.(provider.id, { name: event.target.value })}
                />
              ) : (
                <p className="text-sm uppercase tracking-[0.4em] text-white/60">{provider.name}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
                <span>{provider.accounts.length} cuentas</span>
                <InfoIcon label={`Detalles del proveedor ${provider.name}`} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/50">Rendimiento</p>
              <p className="text-lg font-semibold text-white">{formatPercentWithIndicator(provider.average)}</p>
            </div>
          </div>
        </div>
        <div className="w-full min-w-0 rounded-2xl border border-white/10 bg-gradient-to-b from-black/70 via-black/60 to-black/30 p-4 text-left leading-snug shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Capital disponible</p>
            <p className="mt-1 text-3xl font-semibold leading-tight tracking-tight text-white break-words">
              {provider.total}
            </p>
            <Badge
              className="mt-3 rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em]"
              textColor={provider.accent}
              borderColor={`${provider.accent}40`}
              dotColor={provider.accent}
            >
              Rend. prom.
            </Badge>
        </div>
      </header>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <ColorPicker
            colors={palette}
            selectedColor={provider.accent}
            onSelect={(color) => onProviderColorChange?.(provider.id, color)}
            label="Color de la posición"
          />
        </div>
        <div className="flex min-w-[180px] flex-col items-end gap-3 text-right text-xs uppercase tracking-[0.3em] text-white/60 lg:text-right">
          <span className="text-[0.55rem] text-white/40">Acciones</span>
          {onAddAccount && (
            <button
              type="button"
              onClick={() => onAddAccount(provider.id)}
              className="w-full rounded-full border border-white/20 bg-white/5 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/60 hover:bg-white/10"
            >
              Nueva posición
            </button>
          )}
          {onRemoveProvider && (
            <button
              type="button"
              onClick={() => onRemoveProvider(provider.id)}
              className="w-full rounded-full border border-red-500/50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-red-300 transition hover:border-red-400 hover:text-red-100"
            >
              Eliminar cuenta
            </button>
          )}
        </div>
      </div>
      {provider.isNew && (
        <div className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-3 text-[0.7rem] text-amber-100 animate-pulse">
          <p className="font-semibold text-amber-200">Completa este formulario para guardar</p>
          <p className="text-white/60">Actualiza saldo, tasa y flujo. La tarjeta se convertirá en una cuenta activa.</p>
        </div>
      )}
      <div className="mt-6 grid w-full gap-4 min-w-0 lg:grid-cols-2">
        {provider.accounts.map((account) => (
          <AccountCard
            key={account.id}
            providerId={provider.id}
            account={account}
            onAccountChange={onAccountChange}
            onAccountMetaChange={onAccountMetaChange}
            onRemoveAccount={onRemoveAccount}
            highlightColor={provider.accent}
            etfYieldRate={etfYieldRate}
          />
        ))}
      </div>
    </article>
  );
};

export default memo(ProviderCard);
