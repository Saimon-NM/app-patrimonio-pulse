import type { Provider, Account } from '../model/provider.types';
import type { DividendRecord, ProjectionPoint } from '@/features/projections/model/projection.types';
import type { BalanceSnapshot } from '@/features/portfolio/services/balanceHistoryService';
import { useEffect, useMemo, useRef, useState } from 'react';

import InfoIcon from '@/shared/components/InfoIcon';
import { financialInputBase } from '@/shared/styles/tokens';
import ProviderCard from './ProviderCard';
import ProvidersMasonry from './ProvidersMasonry';
import GlobalChecklistPanel from './GlobalChecklistPanel';
import DataExportPanel from '@/features/portfolio/components/DataExportPanel';
import BalanceHistoryPanel from '@/features/portfolio/components/BalanceHistoryPanel';
import OnboardingGuide from '@/features/portfolio/components/OnboardingGuide';
import { formatCurrencyWithIndicator } from '@/shared/utils/precision';

type AccountField = 'balance' | 'rate';

export type AccountsAndFlowSectionProps = {
  providers: Provider[];
  yieldRate: number;

  // Proyección (para export)
  capitalPoints: ProjectionPoint[];
  baselinePoints: ProjectionPoint[];
  dividendRecords: DividendRecord[];

  // Handlers para tarjetas/cuentas
  onAddProvider: () => void;
  onImportExcel: (file: File) => Promise<void> | void;
  onAccountChange: (providerId: string, accountId: string, field: AccountField, value: number) => void;
  onAccountMetaChange: (providerId: string, accountId: string, updates: Partial<Account>) => void;
  onAddAccount: (providerId: string) => void;
  onProviderColorChange: (providerId: string, color: string) => void;
  onRemoveAccount: (providerId: string, accountId: string) => void;
  onRemoveProvider: (providerId: string) => void;
  onProviderUpdate: (providerId: string, updates: Partial<Provider>) => void;

  // Historial
  history: BalanceSnapshot[];
  currentBalance: number;
  onRegisterSnapshot: () => void;
  onClearHistory: () => void;
  onRemoveSnapshot: (id: string) => void;
};

const AccountsAndFlowSection = ({
  providers,
  yieldRate,
  capitalPoints,
  baselinePoints,
  dividendRecords,
  onAddProvider,
  onImportExcel,
  onAccountChange,
  onAccountMetaChange,
  onAddAccount,
  onProviderColorChange,
  onRemoveAccount,
  onRemoveProvider,
  onProviderUpdate,
  history,
  currentBalance,
  onRegisterSnapshot,
  onClearHistory,
  onRemoveSnapshot,
}: AccountsAndFlowSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const canImport = useMemo(() => Boolean(onImportExcel), [onImportExcel]);

  const [targetProviderId, setTargetProviderId] = useState<string | null>(null);
  const [targetAccountId, setTargetAccountId] = useState<string | null>(null);
  const [addMoneyAmount, setAddMoneyAmount] = useState<string>('');

  useEffect(() => {
    if (!providers.length) return;
    if (targetProviderId) {
      const provider = providers.find((p) => p.id === targetProviderId);
      const hasAccount = provider?.accounts.some((a) => a.id === targetAccountId);
      if (hasAccount) return;
    }

    const nextProvider = providers[0];
    setTargetProviderId(nextProvider.id);
    setTargetAccountId(nextProvider.accounts[0]?.id ?? null);
  }, [providers, targetProviderId, targetAccountId]);

  const selectedProvider = providers.find((p) => p.id === targetProviderId) ?? null;
  const selectedAccount =
    selectedProvider?.accounts.find((a) => a.id === targetAccountId) ?? null;

  const openFilePicker = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = '';
    fileInputRef.current.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const name = (file.name || '').toLowerCase();
    const ok = name.endsWith('.xlsx') || name.endsWith('.xls');
    if (!ok) {
      setToast('Formato no soportado. Usa .xlsx o .xls.');
      window.setTimeout(() => setToast(null), 1600);
      return;
    }

    try {
      setToast('Importando Excel...');
      await onImportExcel(file);
      setToast('Cartera importada');
    } catch (e) {
      setToast('No se pudo importar el Excel');
      // eslint-disable-next-line no-console
      console.warn('[AccountsAndFlowSection] import failed', e);
    } finally {
      window.setTimeout(() => setToast(null), 1800);
    }
  };

  const handleAddMoney = () => {
    if (!selectedProvider || !selectedAccount) return;
    const amount = Number(addMoneyAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setToast('Ingresa un monto válido (> 0).');
      window.setTimeout(() => setToast(null), 1600);
      return;
    }

    const nextBalance = selectedAccount.balance + amount;
    onAccountChange(selectedProvider.id, selectedAccount.id, 'balance', nextBalance);
    setAddMoneyAmount('');
    setToast('Saldo actualizado');
    window.setTimeout(() => setToast(null), 1600);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Cuentas y flujo</p>
            <h2 className="text-lg font-semibold text-white">Edita cada posición</h2>
          </div>
          <InfoIcon label="Actualiza saldos, tasas y flujos para ajustar la proyección." />
        </div>

        <div className="flex items-center gap-2">
          <DataExportPanel
            providers={providers}
            capitalPoints={capitalPoints}
            baselinePoints={baselinePoints}
            dividendRecords={dividendRecords}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={openFilePicker}
            disabled={!canImport}
            className="rounded-full border border-emerald-500/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200 transition hover:bg-emerald-500/10 disabled:opacity-60 disabled:hover:bg-transparent"
          >
            Importar Excel
          </button>

          <button
            type="button"
            onClick={onAddProvider}
            className="rounded-full border border-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-white/30 hover:text-white"
          >
            Agregar cuenta vacía
          </button>
        </div>
      </div>

      {toast ? (
        <div className="text-sm text-white/70" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}

      <GlobalChecklistPanel providers={providers} onAccountMetaChange={onAccountMetaChange} />

      <div className="rounded-3xl border border-white/10 bg-black/30 p-4 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Acción rápida</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Agregar dinero a una posición</h3>
            <p className="mt-1 text-sm text-white/60">
              Evita buscar manualmente: selecciona cuenta y posición, y suma el monto.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-[0.65rem] uppercase tracking-[0.3em] text-white/50">Cuenta (provider)</span>
            <select
              aria-label="Selecciona cuenta"
              value={selectedProvider?.id ?? ''}
              onChange={(e) => {
                const nextProviderId = e.target.value;
                const nextProvider = providers.find((p) => p.id === nextProviderId) ?? null;
                setTargetProviderId(nextProviderId);
                setTargetAccountId(nextProvider?.accounts[0]?.id ?? null);
              }}
              disabled={!providers.length}
              className={`w-full ${financialInputBase} disabled:opacity-60`}
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id} className="bg-black text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[0.65rem] uppercase tracking-[0.3em] text-white/50">Posición (account)</span>
            <select
              aria-label="Selecciona posición"
              value={selectedAccount?.id ?? ''}
              onChange={(e) => setTargetAccountId(e.target.value)}
              disabled={!selectedProvider}
              className={`w-full ${financialInputBase} disabled:opacity-60`}
            >
              {(selectedProvider?.accounts ?? []).map((a) => (
                <option key={a.id} value={a.id} className="bg-black text-white">
                  {a.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[0.65rem] uppercase tracking-[0.3em] text-white/50">Monto (MXN)</span>
            <input
              aria-label="Monto a agregar"
              type="number"
              step="100"
              value={addMoneyAmount}
              onChange={(e) => setAddMoneyAmount(e.target.value)}
              placeholder="Ej. 5000"
              className={`w-full ${financialInputBase} placeholder-white/40`}
            />
            {selectedAccount ? (
              <p className="text-xs text-white/50">
                Saldo actual: {formatCurrencyWithIndicator(selectedAccount.balance)}
              </p>
            ) : null}
          </label>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleAddMoney}
            disabled={!selectedAccount || !addMoneyAmount}
            className="rounded-full border border-emerald-500/60 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200 transition hover:bg-emerald-500/10 disabled:opacity-60 disabled:hover:bg-transparent"
          >
            Sumar a la posición
          </button>
        </div>
      </div>

      <OnboardingGuide />

      <ProvidersMasonry className="pt-2">
        {providers.length > 0 ? (
          providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onAccountChange={onAccountChange}
              onAccountMetaChange={onAccountMetaChange}
              onAddAccount={(providerId) => onAddAccount(providerId)}
              onProviderColorChange={onProviderColorChange}
              etfYieldRate={yieldRate}
              onRemoveAccount={onRemoveAccount}
              onRemoveProvider={onRemoveProvider}
              onProviderUpdate={onProviderUpdate}
            />
          ))
        ) : (
          <div className="w-full rounded-2xl border border-dashed border-white/30 p-6 text-center text-white/60">
            <InfoIcon label="Cargando cuentas..." />
            <p className="mt-3 text-sm">Agrega tus cuentas para personalizar la proyección.</p>
          </div>
        )}
      </ProvidersMasonry>

      <BalanceHistoryPanel
        history={history}
        currentBalance={currentBalance}
        onRegisterSnapshot={() => {
          onRegisterSnapshot();
          setToast('Snapshot registrado');
          window.setTimeout(() => setToast(null), 1600);
        }}
        onClearHistory={() => {
          onClearHistory();
          setToast('Historial borrado');
          window.setTimeout(() => setToast(null), 1600);
        }}
        onRemoveSnapshot={onRemoveSnapshot}
      />
    </section>
  );
};

export default AccountsAndFlowSection;

