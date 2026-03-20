import { useMemo } from 'react';
import type { Provider } from '@/features/accounts/model/provider.types';
import { defaultSummary, type SummarySnapshot } from '@/features/overview/data/summary.data';
import { calculateMonthlyGain } from '@/shared/utils/finance';

export const useFinancialSummary = (providers: Provider[]): SummarySnapshot =>
  useMemo(() => {
    if (!providers.length) {
      return defaultSummary;
    }

    const totalBalance = providers.reduce((providerSum, provider) => {
      const providerBalance = provider.accounts.reduce((acc, account) => acc + account.balance, 0);
      return providerSum + providerBalance;
    }, 0);

    const monthlyPassive = providers.reduce((providerSum, provider) => {
      const providerMonthly = provider.accounts.reduce(
        (acc, account) => acc + calculateMonthlyGain(account.balance, account.rate, { round: false }),
        0
      );
      return providerSum + providerMonthly;
    }, 0);

    const annualPassive = monthlyPassive * 12;

    const averageYield =
      totalBalance > 0
        ? providers.reduce((providerSum, provider) => {
            const providerWeight = provider.accounts.reduce(
              (acc, account) => acc + account.balance * account.rate,
              0
            );
            return providerSum + providerWeight;
          }, 0) / totalBalance
        : defaultSummary.averageYield;

    return {
      total: totalBalance,
      monthlyPassive,
      annualPassive,
      averageYield,
    };
  }, [providers]);
