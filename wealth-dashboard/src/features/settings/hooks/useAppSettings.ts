import { useEffect, useState } from 'react';
import type { AppSettings, CurrencyConfig, GoalConfig } from '@/features/settings/types/settings.types';
import { DEFAULT_SETTINGS, DEFAULT_GOALS } from '@/features/settings/types/settings.types';
import { sanitizeNumber } from '@/shared/utils/validators';

const STORAGE_KEY = 'patrimonio-app-settings';

const normalizeGoals = (goals: Array<Partial<GoalConfig>>) =>
  goals.map((goal, index) => ({
    id: goal.id ?? `goal-${index}-${goal.title ?? 'meta'}`,
    title:
      typeof goal.title === 'string' && goal.title.trim()
        ? goal.title
        : `Meta ${index + 1}`,
    amount:
      typeof goal.amount === 'number' && Number.isFinite(goal.amount) ? goal.amount : 0,
  }));

const readSettingsFromStorage = (): AppSettings => {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    const parsedRaw = JSON.parse(stored);
    if (!parsedRaw || typeof parsedRaw !== 'object') {
      return DEFAULT_SETTINGS;
    }

    const parsed = parsedRaw as Partial<AppSettings> & { goal?: number; goals?: GoalConfig[] };
    const currencies =
      Array.isArray(parsed.currencies) && parsed.currencies.length
        ? parsed.currencies
        : DEFAULT_SETTINGS.currencies;

    const legacyGoals: Array<Partial<GoalConfig>> =
      typeof parsed.goal === 'number'
        ? [{ id: 'goal-legacy', title: 'Meta principal', amount: parsed.goal }]
        : [];

    const rawGoals =
      Array.isArray(parsed.goals) && parsed.goals.length
        ? parsed.goals
        : legacyGoals.length
        ? legacyGoals
        : DEFAULT_GOALS;

    const normalizedGoals = normalizeGoals(rawGoals);
    const activeGoalId =
      normalizedGoals.find((goal) => goal.id === parsed.activeGoalId)?.id ??
      normalizedGoals[0].id;

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      currencies,
      goals: normalizedGoals,
      activeGoalId,
      historyMaxSnapshots: Math.floor(
        sanitizeNumber((parsed as Partial<AppSettings>).historyMaxSnapshots ?? DEFAULT_SETTINGS.historyMaxSnapshots, {
          min: 10,
          max: 365,
          fallback: DEFAULT_SETTINGS.historyMaxSnapshots,
        })
      ),
      taxRatePct: sanitizeNumber((parsed as Partial<AppSettings>).taxRatePct ?? 0, { min: 0, max: 100 }),
      commissionRatePct: sanitizeNumber((parsed as Partial<AppSettings>).commissionRatePct ?? 0, {
        min: 0,
        max: 100,
      }),
      slippageRatePct: sanitizeNumber((parsed as Partial<AppSettings>).slippageRatePct ?? 0, {
        min: 0,
        max: 100,
      }),
    };
  } catch (error) {
    console.warn('[useAppSettings] unable to parse settings', error);
    return DEFAULT_SETTINGS;
  }
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => readSettingsFromStorage());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateUsdRate = (usdRate: number) =>
    setSettings((prev) => ({ ...prev, usdRate }));

  const updateCurrency = (code: string, updates: Partial<Omit<CurrencyConfig, 'code'>>) =>
    setSettings((prev) => ({
      ...prev,
      currencies: prev.currencies.map((currency) =>
        currency.code === code ? { ...currency, ...updates } : currency
      ),
    }));

  const addCurrency = (currency: CurrencyConfig) =>
    setSettings((prev) => ({
      ...prev,
      currencies: [...prev.currencies.filter((item) => item.code !== currency.code), currency],
    }));

  const removeCurrency = (code: string) =>
    setSettings((prev) => ({
      ...prev,
      currencies: prev.currencies.filter((currency) => currency.code !== code),
    }));

  const updateGoalAmount = (goalId: string, amount: number) =>
    setSettings((prev) => ({
      ...prev,
      goals: prev.goals.map((goal) => (goal.id === goalId ? { ...goal, amount } : goal)),
    }));

  const updateGoalTitle = (goalId: string, title: string) =>
    setSettings((prev) => ({
      ...prev,
      goals: prev.goals.map((goal) => (goal.id === goalId ? { ...goal, title } : goal)),
    }));

  const addGoal = (goal: GoalConfig) =>
    setSettings((prev) => ({
      ...prev,
      goals: [...prev.goals, goal],
      activeGoalId: goal.id,
    }));

  const removeGoal = (goalId: string) =>
    setSettings((prev) => {
      if (prev.goals.length === 1) {
        return prev;
      }

      const remainingGoals = prev.goals.filter((goal) => goal.id !== goalId);
      const activeGoalId =
        prev.activeGoalId === goalId ? remainingGoals[0]?.id ?? prev.activeGoalId : prev.activeGoalId;

      return {
        ...prev,
        goals: remainingGoals,
        activeGoalId,
      };
    });

  const setActiveGoal = (goalId: string) =>
    setSettings((prev) => ({
      ...prev,
      activeGoalId: prev.goals.some((goal) => goal.id === goalId) ? goalId : prev.activeGoalId,
    }));

  const updateInflationReference = (inflationReference: number) =>
    setSettings((prev) => ({ ...prev, inflationReference }));
  const updateHistoryMaxSnapshots = (historyMaxSnapshots: number) =>
    setSettings((prev) => ({ ...prev, historyMaxSnapshots: Math.floor(sanitizeNumber(historyMaxSnapshots, { min: 10, max: 365, fallback: prev.historyMaxSnapshots })) }));
  const updateTaxRatePct = (taxRatePct: number) =>
    setSettings((prev) => ({ ...prev, taxRatePct: sanitizeNumber(taxRatePct, { min: 0, max: 100, fallback: prev.taxRatePct }) }));
  const updateCommissionRatePct = (commissionRatePct: number) =>
    setSettings((prev) => ({
      ...prev,
      commissionRatePct: sanitizeNumber(commissionRatePct, { min: 0, max: 100, fallback: prev.commissionRatePct }),
    }));
  const updateSlippageRatePct = (slippageRatePct: number) =>
    setSettings((prev) => ({
      ...prev,
      slippageRatePct: sanitizeNumber(slippageRatePct, { min: 0, max: 100, fallback: prev.slippageRatePct }),
    }));

  return {
    settings,
    updateUsdRate,
    updateCurrency,
    addCurrency,
    removeCurrency,
    updateGoalAmount,
    updateGoalTitle,
    addGoal,
    removeGoal,
    setActiveGoal,
    updateInflationReference,
    updateHistoryMaxSnapshots,
    updateTaxRatePct,
    updateCommissionRatePct,
    updateSlippageRatePct,
    updateTheme: (theme: AppSettings['theme']) => setSettings((prev) => ({ ...prev, theme })),
  };
};
