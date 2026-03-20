import type { FC, ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import SettingsMenuModal from '@/features/settings/components/SettingsMenuModal';
import type { AppSettings, CurrencyConfig, GoalConfig, ThemeMode } from '@/features/settings/types/settings.types';

interface AppShellLayoutProps {
  themeClass: string;
  todayLabel: string;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  settingsModal: {
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
  };
  children: ReactNode;
}

const AppShellLayout: FC<AppShellLayoutProps> = ({
  themeClass,
  todayLabel,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  settingsModal,
  children,
}) => (
  <div
    className={cn('relative min-h-screen w-full bg-gradient-to-br from-[#010101] via-[#050505] to-black text-white', themeClass)}
    data-theme={themeClass}
  >
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_50%)]" />
    <div className="relative flex min-h-screen overflow-hidden">
      <main className="flex-1 overflow-y-auto px-5 py-8 sm:px-10 lg:px-14">
        <header className="mb-6 flex flex-col gap-4 border-b border-white/5 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleMenu}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-black/60 text-white transition hover:border-white/60"
              aria-label={menuOpen ? 'Cerrar menú de configuración' : 'Abrir menú de configuración'}
            >
              <span className="flex flex-col gap-1">
                <span className="block h-0.5 w-5 rounded-full bg-white" />
                <span className="block h-0.5 w-5 rounded-full bg-white" />
                <span className="block h-0.5 w-5 rounded-full bg-white" />
              </span>
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Dashboard</p>
              <h1 className="text-2xl font-semibold text-white">Visión total del patrimonio</h1>
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">{`Actualizado el ${todayLabel}`}</p>
        </header>
        <div className="space-y-8">{children}</div>
      </main>
      <SettingsMenuModal
        isOpen={menuOpen}
        onClose={onCloseMenu}
        settings={settingsModal.settings}
        onUsdRateChange={settingsModal.onUsdRateChange}
        onInflationReferenceChange={settingsModal.onInflationReferenceChange}
        onHistoryMaxSnapshotsChange={settingsModal.onHistoryMaxSnapshotsChange}
        onTaxRatePctChange={settingsModal.onTaxRatePctChange}
        onCommissionRatePctChange={settingsModal.onCommissionRatePctChange}
        onSlippageRatePctChange={settingsModal.onSlippageRatePctChange}
        goals={settingsModal.goals}
        activeGoalId={settingsModal.activeGoalId}
        onGoalAmountChange={settingsModal.onGoalAmountChange}
        onGoalTitleChange={settingsModal.onGoalTitleChange}
        onAddGoal={settingsModal.onAddGoal}
        onRemoveGoal={settingsModal.onRemoveGoal}
        onSelectGoal={settingsModal.onSelectGoal}
        onUpdateCurrency={settingsModal.onUpdateCurrency}
        onAddCurrency={settingsModal.onAddCurrency}
        onRemoveCurrency={settingsModal.onRemoveCurrency}
        onThemeChange={settingsModal.onThemeChange}
      />
    </div>
  </div>
);

export default AppShellLayout;
