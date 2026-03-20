import { useEffect, useRef } from 'react';
import type { AppSettings, CurrencyConfig, GoalConfig, ThemeMode } from '@/features/settings/types/settings.types';
import SettingsMenu from './SettingsMenu';

type SettingsMenuModalProps = {
  isOpen: boolean;
  onClose: () => void;

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

export default function SettingsMenuModal({
  isOpen,
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
}: SettingsMenuModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusableSelector =
      'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';

    const getFocusableElements = () => {
      const modalEl = modalRef.current;
      if (!modalEl) return [] as HTMLElement[];
      return Array.from(modalEl.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
      );
    };

    // Focus inicial para que la navegación con teclado quede dentro del modal.
    const focusables = getFocusableElements();
    (focusables[0] ?? modalRef.current)?.focus?.();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown, true);

    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) return;
    lastFocusedRef.current?.focus?.();
    lastFocusedRef.current = null;
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar menú de configuración"
        onClick={onClose}
        className="fixed inset-0 z-20 cursor-default bg-black/60 backdrop-blur-sm"
      />
      <div
        className="fixed inset-0 z-30 flex items-center justify-center p-4 sm:p-6"
        onClick={onClose}
        role="presentation"
        ref={modalRef}
        tabIndex={-1}
      >
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[420px]">
          <SettingsMenu
            className="max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-black/90 px-5 py-6 shadow-2xl"
            isOpen
            settings={settings}
            onUsdRateChange={onUsdRateChange}
            onInflationReferenceChange={onInflationReferenceChange}
            onHistoryMaxSnapshotsChange={onHistoryMaxSnapshotsChange}
            onTaxRatePctChange={onTaxRatePctChange}
            onCommissionRatePctChange={onCommissionRatePctChange}
            onSlippageRatePctChange={onSlippageRatePctChange}
            goals={goals}
            activeGoalId={activeGoalId}
            onGoalAmountChange={onGoalAmountChange}
            onGoalTitleChange={onGoalTitleChange}
            onAddGoal={onAddGoal}
            onRemoveGoal={onRemoveGoal}
            onSelectGoal={onSelectGoal}
            onUpdateCurrency={onUpdateCurrency}
            onAddCurrency={onAddCurrency}
            onRemoveCurrency={onRemoveCurrency}
            onThemeChange={onThemeChange}
            onClose={onClose}
          />
        </div>
      </div>
    </>
  );
}

