import { useMemo, useState } from 'react';
import type { FC } from 'react';
import type { AppSettings, CurrencyConfig, GoalConfig, ThemeMode } from '@/features/settings/types/settings.types';
import InfoIcon from '@/shared/components/InfoIcon';

interface SettingsMenuProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  settings: AppSettings;
  onUsdRateChange: (value: number) => void;
  onInflationReferenceChange: (value: number) => void;
  onHistoryMaxSnapshotsChange: (value: number) => void;
  onTaxRatePctChange: (value: number) => void;
  onCommissionRatePctChange: (value: number) => void;
  onSlippageRatePctChange: (value: number) => void;
  goals: GoalConfig[];
  activeGoalId: string;
  onGoalAmountChange: (goalId: string, amount: number) => void;
  onGoalTitleChange: (goalId: string, title: string) => void;
  onAddGoal: () => void;
  onRemoveGoal: (goalId: string) => void;
  onSelectGoal: (goalId: string) => void;
  onUpdateCurrency: (code: string, updates: Partial<Omit<CurrencyConfig, 'code'>>) => void;
  onAddCurrency: (currency: CurrencyConfig) => void;
  onRemoveCurrency: (code: string) => void;
  onThemeChange: (theme: ThemeMode) => void;
}

const SettingsMenu: FC<SettingsMenuProps> = ({
  className = '',
  isOpen = true,
  onClose,
  settings,
  onUsdRateChange,
  onInflationReferenceChange,
  onHistoryMaxSnapshotsChange,
  onTaxRatePctChange,
  onCommissionRatePctChange,
  onSlippageRatePctChange,
  goals,
  activeGoalId,
  onGoalAmountChange,
  onGoalTitleChange,
  onAddGoal,
  onRemoveGoal,
  onSelectGoal,
  onUpdateCurrency,
  onAddCurrency,
  onRemoveCurrency,
  onThemeChange,
}) => {
  const [draft, setDraft] = useState<CurrencyConfig>({ code: '', symbol: '$', rateToMxn: 1 });
  const themeOptions: { value: ThemeMode; label: string; description: string }[] = [
    { value: 'dark', label: 'Oscuro', description: 'Contrastes suaves con foco en detalles.' },
    { value: 'contrast', label: 'Contrastado', description: 'Bordes y textos más nítidos para accesibilidad.' },
  ];

  const sortedCurrencies = useMemo(
    () => [...settings.currencies].sort((a, b) => a.code.localeCompare(b.code)),
    [settings.currencies]
  );

  const handleAddCurrency = () => {
    if (!draft.code.trim() || !draft.symbol.trim() || draft.rateToMxn <= 0) {
      return;
    }
    onAddCurrency({ ...draft, code: draft.code.toUpperCase().trim() });
    setDraft({ code: '', symbol: '$', rateToMxn: 1 });
  };

  const handleCurrencyChange = (code: string, field: keyof CurrencyConfig, value: string) => {
    if (field === 'rateToMxn') {
      const parsed = Number(value);
      if (Number.isNaN(parsed)) return;
      onUpdateCurrency(code, { rateToMxn: parsed });
      return;
    }
    onUpdateCurrency(code, { [field]: value });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      aria-describedby="settings-desc"
      className={[
        'flex min-h-0 min-w-0 flex-col gap-6 overflow-x-hidden px-5 py-6 text-sm text-white',
        className,
      ]
        .join(' ')
        .trim()}
    >
      <p id="settings-desc" className="sr-only">
        Configura metas, monedas y el tema visual del dashboard.
      </p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/60">Configuración global</p>
          <h2 id="settings-title" className="text-lg font-semibold text-white">
            Controles
          </h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs uppercase tracking-[0.4em] text-white/60 transition hover:text-white"
          >
            Cerrar
          </button>
        )}
      </div>

      <div className="space-y-4 text-xs uppercase tracking-[0.3em] text-white/60">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-white/60">
            <span>Metas de capital</span>
            <button
              type="button"
              onClick={onAddGoal}
              className="rounded-2xl border border-white/20 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/60 transition hover:border-white/50 hover:text-white"
            >
              Agregar meta
            </button>
          </div>
          <div className="space-y-3">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className={`space-y-2 rounded-2xl border px-3 py-2 ${
                  activeGoalId === goal.id ? 'border-white/60 bg-white/5' : 'border-white/10 bg-black/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    aria-label={`Título de ${goal.title}`}
                    value={goal.title}
                    onChange={(event) => onGoalTitleChange(goal.id, event.target.value)}
                    className="flex-1 rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder-white/50 focus:border-cyan-400 focus:outline-none"
                    placeholder="Nombre de la meta"
                  />
                  <button
                    type="button"
                    onClick={() => onSelectGoal(goal.id)}
                    className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] transition ${
                      activeGoalId === goal.id
                        ? 'border border-white/60 bg-white/10 text-white'
                        : 'border border-white/30 text-white/60'
                    }`}
                  >
                    {activeGoalId === goal.id ? 'Activa' : 'Activar'}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <label className="flex-1 text-[0.6rem] uppercase tracking-[0.3em] text-white/40">
                    Meta (MXN)
                    <input
                      type="number"
                      step="1000"
                      value={goal.amount}
                      onChange={(event) => onGoalAmountChange(goal.id, Number(event.target.value))}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right text-sm font-semibold text-white focus:border-white/40 focus:outline-none"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => onRemoveGoal(goal.id)}
                    disabled={goals.length === 1}
                    className="rounded-2xl border border-rose-400/60 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-rose-200 transition hover:border-rose-300 hover:text-white disabled:text-white/30 disabled:border-white/10"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <label className="flex flex-col gap-2">
          Tasa USD (TC)
          <input
            type="number"
            step="0.01"
            value={settings.usdRate}
            onChange={(event) => onUsdRateChange(Number(event.target.value))}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-2">
          Inflación anual (referencia)
          <input
            type="number"
            step="0.1"
            value={settings.inflationReference}
            onChange={(event) => onInflationReferenceChange(Number(event.target.value))}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
          />
          <p className="text-[0.6rem] text-white/50">
            Se usa solo como marca informativa en el control de inflación del simulador.
          </p>
        </label>

        <label className="flex flex-col gap-2">
          Historial: max snapshots
          <input
            type="number"
            step="1"
            min={10}
            max={365}
            value={settings.historyMaxSnapshots}
            onChange={(event) => onHistoryMaxSnapshotsChange(Number(event.target.value))}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
          />
          <p className="text-[0.6rem] text-white/50">
            Controla cuántos snapshots conserva el historial local.
          </p>
        </label>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-[0.65rem] text-white/70">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/60">Modelo neto (fricciones)</p>
          <div className="grid gap-2 md:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span className="text-[0.6rem] uppercase tracking-[0.3em] text-white/50">Impuestos %</span>
              <input
                type="number"
                step="0.1"
                min={0}
                max={100}
                value={settings.taxRatePct}
                onChange={(event) => onTaxRatePctChange(Number(event.target.value))}
                className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[0.6rem] uppercase tracking-[0.3em] text-white/50">Comisiones %</span>
              <input
                type="number"
                step="0.1"
                min={0}
                max={100}
                value={settings.commissionRatePct}
                onChange={(event) => onCommissionRatePctChange(Number(event.target.value))}
                className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[0.6rem] uppercase tracking-[0.3em] text-white/50">Slippage %</span>
              <input
                type="number"
                step="0.1"
                min={0}
                max={100}
                value={settings.slippageRatePct}
                onChange={(event) => onSlippageRatePctChange(Number(event.target.value))}
                className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-white/10 pt-5 text-xs uppercase tracking-[0.3em] text-white/60">
        <p className="flex items-center justify-between">
          <span>Tema visual</span>
          <InfoIcon label="Elige palette para toda la app" />
        </p>
        <div className="flex flex-wrap gap-2">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onThemeChange(option.value)}
              className={`flex flex-col gap-1 rounded-2xl border px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.3em] transition ${
                settings.theme === option.value
                  ? 'border-white/80 bg-white/10 text-white'
                  : 'border-white/20 bg-black/40 text-white/60'
              }`}
            >
              <span>{option.label}</span>
              <span className="text-[0.55rem] tracking-[0.2em] text-white/50">{option.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3 border-t border-white/10 pt-5">
        <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-white/60">
          <span>Monedas</span>
          <InfoIcon label="Agrega las divisas que quieres ver con su tasa MXN" />
        </div>
        <div className="flex min-w-0 flex-col gap-2 text-sm">
          {sortedCurrencies.map((currency) => (
            <div
              key={currency.code}
              className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_minmax(0,1.5fr)_auto] items-center gap-2 rounded-2xl border border-white/10 p-2"
            >
              <span className="truncate text-xs font-semibold uppercase tracking-[0.3em] text-white/60">{currency.code}</span>
              <input
                aria-label={`${currency.code} símbolo`}
                value={currency.symbol}
                onChange={(event) => handleCurrencyChange(currency.code, 'symbol', event.target.value)}
                className="min-w-0 rounded-2xl border border-white/10 bg-white/5 px-2 py-1 text-right text-sm text-white focus:border-white/40 focus:outline-none"
              />
              <input
                aria-label={`${currency.code} rate`}
                type="number"
                step="0.01"
                value={currency.rateToMxn}
                onChange={(event) => handleCurrencyChange(currency.code, 'rateToMxn', event.target.value)}
                className="min-w-0 rounded-2xl border border-white/10 bg-white/5 px-2 py-1 text-right text-sm text-white focus:border-white/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onRemoveCurrency(currency.code)}
                className="text-[0.6rem] uppercase tracking-[0.4em] text-rose-400 transition hover:text-rose-200"
              >
                eliminar
              </button>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs uppercase tracking-[0.3em] text-white/60">
          <p>Agregar moneda</p>
          <div className="mt-3 grid gap-2 text-sm">
            <input
              aria-label="Código moneda"
              placeholder="Código"
              value={draft.code}
              onChange={(event) => setDraft((prev) => ({ ...prev, code: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
            />
            <input
              aria-label="Símbolo moneda"
              placeholder="Símbolo"
              value={draft.symbol}
              onChange={(event) => setDraft((prev) => ({ ...prev, symbol: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
            />
            <input
              aria-label="Equivalencia MXN"
              placeholder="MXN por unidad"
              type="number"
              step="0.01"
              value={draft.rateToMxn}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  rateToMxn: Number(event.target.value) || 0,
                }))
              }
              className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddCurrency}
              className="rounded-2xl bg-emerald-500/80 px-3 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-400/90"
            >
              Agregar moneda
            </button>
          </div>
        </div>
        <p className="text-[0.6rem] text-white/50">
          Conversión actual de MXN hacia cada divisa y meta del dashboard. Pronto más configuraciones.
        </p>
      </div>
    </div>
  );
};

export default SettingsMenu;
