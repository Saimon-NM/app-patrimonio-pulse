import type { Account, Provider } from '@/features/accounts/model/provider.types';
import { defaultProviders } from '@/features/accounts/data/providers.data';
import { formatCurrencyWithIndicator } from '@/shared/utils/precision';

const STORAGE_KEY = 'patrimonio-providers';
const STORAGE_VERSION = 1;

const formatProviderTotal = (value: number) =>
  value > 0 ? `${formatCurrencyWithIndicator(value)} MXN` : '$0 MXN';

const summarizeAccounts = (accounts: Account[]) => {
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const average =
    totalBalance > 0
      ? accounts.reduce((sum, account) => sum + account.balance * account.rate, 0) / totalBalance
      : 0;
  return { average, total: formatProviderTotal(totalBalance) };
};

export const enrichProvider = (provider: Provider): Provider => {
  const { average, total } = summarizeAccounts(provider.accounts);
  return { ...provider, average, total };
};

const isValidAccount = (a: unknown): a is Account => {
  if (!a || typeof a !== 'object') return false;
  const x = a as Record<string, unknown>;
  return (
    typeof x.id === 'string' &&
    typeof x.name === 'string' &&
    typeof x.balance === 'number' &&
    Number.isFinite(x.balance) &&
    typeof x.rate === 'number' &&
    Number.isFinite(x.rate)
  );
};

const normalizeChecklist = (raw: unknown): NonNullable<Account['checklist']> => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      if (typeof row.id !== 'string' || typeof row.label !== 'string') return null;
      return {
        id: row.id,
        label: row.label,
        done: Boolean(row.done),
      };
    })
    .filter((item): item is NonNullable<Account['checklist']>[number] => item != null);
};

const normalizeAccount = (raw: unknown): Account | null => {
  if (!isValidAccount(raw)) return null;
  const a = raw as Partial<Account>;
  const balance = Math.max(0, a.balance ?? 0);
  const rate = Math.max(0, Math.min(100, a.rate ?? 0));
  const monthly = (balance * rate) / 1200;
  return {
    id: a.id!,
    name: a.name ?? 'Sin nombre',
    desc: a.desc ?? '',
    balance,
    rate,
    monthly,
    maxBalance: a.maxBalance != null && Number.isFinite(a.maxBalance) ? Math.max(0, a.maxBalance) : undefined,
    includeInRecommendations: a.includeInRecommendations ?? true,
    checklist: normalizeChecklist(a.checklist),
    notes: typeof a.notes === 'string' ? a.notes : '',
  };
};

const isValidProvider = (p: unknown): p is Provider => {
  if (!p || typeof p !== 'object') return false;
  const x = p as Record<string, unknown>;
  return typeof x.id === 'string' && typeof x.name === 'string' && Array.isArray(x.accounts);
};

export const readProvidersFromStorage = (): Provider[] => {
  if (typeof window === 'undefined') {
    return defaultProviders.map(enrichProvider);
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultProviders.map(enrichProvider);
    }

    const parsed = JSON.parse(stored) as unknown;
    let items: unknown[] = [];
    if (parsed && typeof parsed === 'object' && 'version' in parsed && 'data' in parsed) {
      items = Array.isArray(parsed.data) ? parsed.data : [];
    } else if (Array.isArray(parsed)) {
      items = parsed;
    }

    const providers: Provider[] = items
      .filter(isValidProvider)
      .map((p) => {
        const accounts = (p.accounts as unknown[])
          .map(normalizeAccount)
          .filter((a): a is Account => a != null);
        return enrichProvider({
          ...p,
          accounts,
        });
      });

    return providers.length > 0 ? providers : defaultProviders.map(enrichProvider);
  } catch (error) {
    console.warn('[providerStorageService] failed to parse stored providers', error);
    return defaultProviders.map(enrichProvider);
  }
};

export const saveProviders = (providers: Provider[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: STORAGE_VERSION, data: providers })
  );
};

export const createPlaceholderAccount = (providerId: string): Account => ({
  id: `placeholder-account-${Date.now()}-${providerId}`,
  name: 'Nueva posición',
  desc: 'Completa los datos para guardar',
  balance: 0,
  rate: 0,
  monthly: 0,
  includeInRecommendations: true,
  checklist: [],
  notes: '',
});

export const createPlaceholderProvider = (): Provider => {
  const id = `placeholder-${Date.now()}`;
  return {
    id,
    name: `Nueva cuenta ${Date.now()}`,
    average: 0,
    total: '$0 MXN',
    accent: '#38bdf8',
    accentLabel: '#38bdf8',
    isNew: true,
    accounts: [createPlaceholderAccount(id)],
  };
};
