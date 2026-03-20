import { useCallback } from 'react';
import type { Account, Provider } from '@/features/accounts/model/provider.types';
import { calculateMonthlyGain } from '@/shared/utils/finance';
import { sanitizeNumber, MAX_BALANCE, MAX_RATE_PCT, MAX_MAX_BALANCE } from '@/shared/utils/validators';

type AccountField = 'balance' | 'rate';

interface UseAccountsControllerInput {
  providers: Provider[];
  updateAccount: (providerId: string, accountId: string, updates: Partial<Account>) => void;
  updateProvider: (providerId: string, updates: Partial<Provider>) => void;
  addAccount: (providerId: string, rate?: number) => void;
  removeAccount: (providerId: string, accountId: string) => void;
  removeProvider: (providerId: string) => void;
  addProvider: () => void;
  defaultAnnualRate: number;
}

export const useAccountsController = ({
  providers,
  updateAccount,
  updateProvider,
  addAccount,
  removeAccount,
  removeProvider,
  addProvider,
  defaultAnnualRate,
}: UseAccountsControllerInput) => {
  const onAccountChange = useCallback(
    (providerId: string, accountId: string, field: AccountField, value: number) => {
      const provider = providers.find((item) => item.id === providerId);
      const account = provider?.accounts.find((item) => item.id === accountId);
      const sanitizedValue = sanitizeNumber(value, {
        fallback: field === 'balance' ? account?.balance ?? 0 : account?.rate ?? 0,
        min: 0,
        max: field === 'balance' ? MAX_BALANCE : MAX_RATE_PCT,
      });

      if (!Number.isFinite(sanitizedValue)) {
        return;
      }

      const updates: Partial<Account> = { [field]: sanitizedValue };
      let currentBalance = field === 'balance' ? sanitizedValue : account?.balance ?? 0;
      const currentRate = field === 'rate' ? sanitizedValue : account?.rate ?? 0;

      updates.monthly = calculateMonthlyGain(currentBalance, currentRate);

      updateAccount(providerId, accountId, updates);
    },
    [providers, updateAccount]
  );

  const onAccountMetaChange = useCallback(
    (providerId: string, accountId: string, updates: Partial<Provider['accounts'][number]>) => {
      const sanitized: Partial<Provider['accounts'][number]> = { ...updates };
      if (updates.maxBalance !== undefined) {
        const v = updates.maxBalance;
        sanitized.maxBalance =
          v === undefined || !Number.isFinite(v)
            ? undefined
            : sanitizeNumber(v, { min: 0, max: MAX_MAX_BALANCE });
      }
      updateAccount(providerId, accountId, sanitized);
    },
    [updateAccount]
  );

  const onAddAccount = useCallback(
    (providerId: string) => {
      addAccount(providerId, defaultAnnualRate);
    },
    [addAccount, defaultAnnualRate]
  );

  const onProviderUpdate = useCallback(
    (providerId: string, updates: Partial<Provider>) => {
      updateProvider(providerId, updates);
    },
    [updateProvider]
  );

  const onProviderColorChange = useCallback(
    (providerId: string, color: string) => {
      updateProvider(providerId, { accent: color, accentLabel: color });
    },
    [updateProvider]
  );

  const confirmAndRemoveAccount = useCallback(
    (providerId: string, accountId: string) => {
      const message = '¿Eliminar esta posición? Todos los datos se perderán.';
      if (window.confirm(message)) {
        removeAccount(providerId, accountId);
      }
    },
    [removeAccount]
  );

  const confirmAndRemoveProvider = useCallback(
    (providerId: string) => {
      const message = '¿Estás seguro de cancelar esta cuenta?';
      if (window.confirm(message)) {
        removeProvider(providerId);
      }
    },
    [removeProvider]
  );

  return {
    addProvider,
    onAccountChange,
    onAccountMetaChange,
    onAddAccount,
    onProviderUpdate,
    onProviderColorChange,
    confirmAndRemoveAccount,
    confirmAndRemoveProvider,
  };
};

