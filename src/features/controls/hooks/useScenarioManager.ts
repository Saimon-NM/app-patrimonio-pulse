import { useCallback, useEffect, useState } from 'react';
import type { DashboardParameters } from './useDashboardParameters';
import { sanitizeNumber } from '@/shared/utils/validators';

const STORAGE_KEY = 'patrimonio-scenarios';

export type SavedScenario = {
  name: string;
  params: DashboardParameters;
  createdAt: string;
};

const sanitizeScenarioParams = (raw: unknown): DashboardParameters | null => {
  if (!raw || typeof raw !== 'object') return null;
  const x = raw as Partial<DashboardParameters>;
  const frequency = x.compoundingFrequency === 'annual' ? 'annual' : 'monthly';
  return {
    income: sanitizeNumber(x.income ?? 0, { min: 0, fallback: 0 }),
    contribution: sanitizeNumber(x.contribution ?? 0, { min: 0, fallback: 0 }),
    yieldRate: sanitizeNumber(x.yieldRate ?? 0, { min: 0, max: 100, fallback: 0 }),
    horizon: Math.floor(sanitizeNumber(x.horizon ?? 1, { min: 1, max: 80, fallback: 1 })),
    inflation: sanitizeNumber(x.inflation ?? 0, { min: -99, max: 100, fallback: 0 }),
    compoundingFrequency: frequency,
  };
};

const readScenarios = (): SavedScenario[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const row = item as Partial<SavedScenario>;
        if (typeof row.name !== 'string' || !row.name.trim()) return null;
        const params = sanitizeScenarioParams(row.params);
        if (!params) return null;
        return {
          name: row.name.trim(),
          params,
          createdAt: typeof row.createdAt === 'string' ? row.createdAt : new Date().toISOString(),
        } satisfies SavedScenario;
      })
      .filter((item): item is SavedScenario => item != null);
  } catch {
    return [];
  }
};

export const useScenarioManager = (params: DashboardParameters, applyScenario: (params: DashboardParameters) => void) => {
  const [scenarios, setScenarios] = useState<SavedScenario[]>(() => readScenarios());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  }, [scenarios]);

  const saveScenario = useCallback(
    (name: string) => {
      const normalized = name.trim();
      if (!normalized) return;
      setScenarios((prev) => {
        const exists = prev.find((item) => item.name.toLowerCase() === normalized.toLowerCase());
        const newScenario: SavedScenario = {
          name: normalized,
          params,
          createdAt: new Date().toISOString(),
        };
        if (exists) {
          return prev.map((item) => (item.name === exists.name ? newScenario : item));
        }
        return [...prev, newScenario];
      });
    },
    [params]
  );

  const apply = useCallback(
    (scenario: SavedScenario) => {
      applyScenario(scenario.params);
    },
    [applyScenario]
  );

  const removeScenario = useCallback((name: string) => {
    setScenarios((prev) => prev.filter((item) => item.name !== name));
  }, []);

  return { scenarios, saveScenario, apply, removeScenario };
};
