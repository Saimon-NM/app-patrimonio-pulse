import { useEffect, useState } from 'react';
import type { Account, Provider } from '@/features/accounts/model/provider.types';
import {
  createPlaceholderAccount,
  createPlaceholderProvider,
  enrichProvider,
  readProvidersFromStorage,
  saveProviders,
} from '@/features/portfolio/services/providerStorageService';
import { defaultProviders } from '@/features/accounts/data/providers.data';
import { calculateMonthlyGain } from '@/shared/utils/finance';

const normalizeKey = (value: string) => value.trim().toUpperCase().replace(/\s*\*$/g, '');

export const useProvidersState = () => {
  const [providers, setProviders] = useState<Provider[]>(() => readProvidersFromStorage());

  useEffect(() => {
    saveProviders(providers);
  }, [providers]);

  const updateAccount = (providerId: string, accountId: string, updates: Partial<Account>) => {
    const hasMeaningfulData =
      updates.balance !== undefined ||
      updates.rate !== undefined ||
      updates.maxBalance !== undefined ||
      updates.includeInRecommendations !== undefined ||
      updates.monthly !== undefined ||
      updates.name !== undefined ||
      updates.desc !== undefined;
    setProviders((prev) =>
      prev.map((provider) =>
        provider.id === providerId
          ? enrichProvider({
              ...provider,
              isNew: provider.isNew && !hasMeaningfulData,
              accounts: provider.accounts.map((account) =>
                account.id === accountId ? { ...account, ...updates } : account
              ),
            })
          : provider
      )
    );
  };

  const updateProvider = (providerId: string, updates: Partial<Provider>) => {
    const hasMeaningful = !!updates.name;
    setProviders((prev) =>
      prev.map((provider) =>
        provider.id === providerId
          ? enrichProvider({ ...provider, isNew: provider.isNew && !hasMeaningful, ...updates })
          : provider
      )
    );
  };

  const addProvider = () => {
    setProviders((prev) => [...prev, enrichProvider(createPlaceholderProvider())]);
  };

  const addProviderWithAccounts = (args: {
    name: string;
    accent?: string;
    accounts: Array<Pick<Account, 'name' | 'desc' | 'balance' | 'rate'>>;
  }) => {
    setProviders((prev) => {
      const base = createPlaceholderProvider();
      const providerId = base.id;
      const accent = args.accent ?? base.accent;

      const nextAccounts: Account[] = args.accounts.map((a) => {
        const monthly = calculateMonthlyGain(a.balance, a.rate);
        return {
          ...createPlaceholderAccount(providerId),
          id: `import-${normalizeKey(a.name)}-${providerId}-${Date.now()}`,
          name: a.name,
          desc: a.desc ?? '',
          balance: a.balance,
          rate: a.rate,
          monthly,
        };
      });

      const nextProvider: Provider = enrichProvider({
        ...base,
        name: args.name,
        accent,
        accentLabel: accent,
        isNew: false,
        accounts: nextAccounts,
      });

      return [...prev, nextProvider];
    });
  };

  const removeProvider = (id: string) => {
    setProviders((prev) => prev.filter((provider) => provider.id !== id));
  };

  const addAccount = (providerId: string, rate = 0) => {
    setProviders((prev) =>
      prev.map((provider) =>
        provider.id === providerId
          ? enrichProvider({
              ...provider,
              accounts: [
                ...provider.accounts,
                {
                  ...createPlaceholderAccount(providerId),
                  rate,
                },
              ],
            })
          : provider
      )
    );
  };

  const removeAccount = (providerId: string, accountId: string) => {
    setProviders((prev) =>
      prev.map((provider) =>
        provider.id === providerId
          ? enrichProvider({
              ...provider,
              accounts: provider.accounts.filter((account) => account.id !== accountId),
            })
          : provider
      )
    );
  };

  return {
    providers,
    updateAccount,
    updateProvider,
    addAccount,
    removeAccount,
    resetProviders: () => setProviders(defaultProviders.map(enrichProvider)),
    addProvider,
    addProviderWithAccounts,
    removeProvider,
  };
};
