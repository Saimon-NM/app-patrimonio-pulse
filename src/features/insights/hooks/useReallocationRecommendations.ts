import { useMemo } from 'react';
import type { Provider } from '@/features/accounts/model/provider.types';
import { calculateMonthlyGain } from '@/shared/utils/finance';

type AccountCandidate = {
  providerName: string;
  accountName: string;
  key: string;
  balance: number;
  maxBalance?: number;
  canIncrease: boolean;
  isIncluded: boolean;
  balancePct: number;
  returnPerMxN: number;
  monthly: number;
  monthlyPct: number;
  rate: number;
};

export type ReallocationRecommendation = {
  topToIncrease: AccountCandidate[];
  toReduce: AccountCandidate[];
  scopedTotalMonthly: number;
  excludedCount: number;
  includedCount: number;
};

const clamp = (value: number) => Math.min(100, Math.max(0, value));

export const useReallocationRecommendations = (providers: Provider[]) => {
  return useMemo(() => {
    const accounts: AccountCandidate[] = providers.flatMap((provider) =>
      provider.accounts.map((account) => {
        // Para no depender del `monthly` ya redondeado en estado/almacenamiento,
        // recalculamos siempre con `round: false` para mantener consistencia.
        const monthly = calculateMonthlyGain(account.balance, account.rate, { round: false });
        const maxBalance = account.maxBalance;
        const canIncrease =
          maxBalance === undefined || !Number.isFinite(maxBalance) ? true : account.balance < maxBalance;
        const isIncluded = account.includeInRecommendations ?? true;
        const returnPerMxN =
          account.balance > 0
            ? monthly / account.balance
            : account.rate > 0
              ? account.rate / 1200
              : 0;

        const key = `${provider.id}:${account.id}`;
        return {
          providerName: provider.name,
          accountName: account.name,
          key,
          balance: account.balance ?? 0,
          maxBalance,
          canIncrease,
          isIncluded,
          balancePct: 0,
          returnPerMxN,
          monthly,
          monthlyPct: 0,
          rate: account.rate ?? 0,
        };
      })
    );

    const scopedAccounts = accounts.filter((a) => a.isIncluded);
    const totalBalance = scopedAccounts.reduce((sum, a) => sum + (a.balance > 0 ? a.balance : 0), 0);
    const totalMonthly = scopedAccounts.reduce((sum, a) => sum + (a.monthly > 0 ? a.monthly : 0), 0);

    const excludedCount = accounts.filter((a) => !a.isIncluded).length;
    const includedCount = scopedAccounts.length;

    if (!totalBalance || !totalMonthly || scopedAccounts.length < 2) {
      return {
        topToIncrease: [],
        toReduce: [],
        scopedTotalMonthly: 0,
        excludedCount,
        includedCount,
      } satisfies ReallocationRecommendation;
    }

    const withPcts = scopedAccounts.map((a) => ({
      ...a,
      balancePct: clamp((a.balance / totalBalance) * 100),
      monthlyPct: clamp((a.monthly / totalMonthly) * 100),
    }));

    // Para maximizar ingresos, el criterio debe ser el rendimiento incremental (return por MXN),
    // no el peso que cada cuenta tiene en el ingreso total (% de monthly).
    const sortedByReturnDesc = [...withPcts].sort((a, b) => b.returnPerMxN - a.returnPerMxN);
    const topToIncrease = sortedByReturnDesc.filter((a) => a.canIncrease).slice(0, 3);

    const sortedByReturnAsc = [...withPcts].sort((a, b) => a.returnPerMxN - b.returnPerMxN);
    const toReduce = sortedByReturnAsc.filter((a) => a.balance > 0).slice(0, 2);

    return {
      topToIncrease,
      toReduce,
      scopedTotalMonthly: totalMonthly,
      excludedCount,
      includedCount,
    } satisfies ReallocationRecommendation;
  }, [providers]);
};

