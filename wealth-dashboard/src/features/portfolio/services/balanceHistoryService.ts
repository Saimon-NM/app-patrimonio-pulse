export type BalanceSnapshot = {
  id: string;
  recordedAt: string; // ISO
  totalBalance: number;
  monthlyPassive: number;
};

const STORAGE_KEY = 'patrimonio-balance-history';
const STORAGE_VERSION = 1;

const normalizeNumber = (value: number) => (Number.isFinite(value) ? value : 0);

export const readBalanceHistoryFromStorage = (): BalanceSnapshot[] => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    let items: unknown[] = [];
    if (parsed && typeof parsed === 'object' && 'version' in parsed && 'data' in parsed) {
      items = Array.isArray(parsed.data) ? parsed.data : [];
    } else if (Array.isArray(parsed)) {
      items = parsed;
    }

    const normalized = items
      .map((item): BalanceSnapshot | null => {
        if (!item || typeof item !== 'object') return null;
        const record = item as Partial<BalanceSnapshot>;
        if (typeof record.id !== 'string' || typeof record.recordedAt !== 'string') return null;
        return {
          id: record.id,
          recordedAt: record.recordedAt,
          totalBalance: normalizeNumber(record.totalBalance ?? 0),
          monthlyPassive: normalizeNumber(record.monthlyPassive ?? 0),
        };
      })
      .filter((x): x is BalanceSnapshot => Boolean(x));

    // Ascendente para que la gráfica y tabla tengan un orden estable.
    return normalized.sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
  } catch (error) {
    console.warn('[balanceHistoryService] failed to parse stored history', error);
    return [];
  }
};

export const saveBalanceHistory = (history: BalanceSnapshot[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: STORAGE_VERSION, data: history })
  );
};

export const clearBalanceHistoryStorage = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
};

export const takeBalanceSnapshot = (input: { totalBalance: number; monthlyPassive: number }): BalanceSnapshot => {
  const recordedAt = new Date().toISOString();
  return {
    id: recordedAt,
    recordedAt,
    totalBalance: normalizeNumber(input.totalBalance),
    monthlyPassive: normalizeNumber(input.monthlyPassive),
  };
};

