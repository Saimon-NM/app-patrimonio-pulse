import { useMemo } from 'react';
import type { Provider } from '@/features/accounts/model/provider.types';
import { allocationBreakdown as staticAllocation } from '@/features/accounts/data/providers.data';

export const useAllocationBreakdown = (providers: Provider[]) =>
  useMemo(() => {
    if (!providers.length) {
      return staticAllocation;
    }

    const totals = providers.map((provider) =>
      provider.accounts.reduce((sum, account) => sum + account.balance, 0)
    );
    const totalBalance = totals.reduce((sum, value) => sum + value, 0);

    return providers.map((provider, index) => ({
      name: provider.name,
      percent: totalBalance ? (totals[index] / totalBalance) * 100 : 0,
      color: provider.accent,
    }));
  }, [providers]);
