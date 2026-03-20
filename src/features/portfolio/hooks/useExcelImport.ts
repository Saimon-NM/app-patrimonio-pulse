import { useCallback } from 'react';
import type { Provider } from '@/features/accounts/model/provider.types';
import type { Account } from '@/features/accounts/model/provider.types';
import { buildImportedAccount, parseExcelHoldingsFile } from '@/features/portfolio/services/excelImportService';

const normalizeKey = (value: string) => value.trim().toUpperCase().replace(/\s*\*$/g, '');

interface UseExcelImportInput {
  providers: Provider[];
  yieldRate: number;
  addProviderWithAccounts: (args: {
    name: string;
    accent?: string;
    accounts: Array<Pick<Account, 'name' | 'desc' | 'balance' | 'rate'>>;
  }) => void;
  updateProvider: (providerId: string, updates: Partial<Provider>) => void;
}

export const useExcelImport = ({
  providers,
  yieldRate,
  addProviderWithAccounts,
  updateProvider,
}: UseExcelImportInput) =>
  useCallback(
    async (file: File) => {
      const parsed = await parseExcelHoldingsFile(file);
      if (!parsed.holdings.length) {
        throw new Error('No se encontraron posiciones en el Excel');
      }

      const targetProviderName = parsed.providerName;
      const targetProvider =
        providers.find((p) => normalizeKey(p.name).includes(normalizeKey(targetProviderName))) ?? null;

      if (!targetProvider) {
        const accounts = parsed.holdings.map((h) => ({
          name: h.name,
          desc: h.desc ?? '',
          balance: h.balance,
          rate: h.rateAnnualPct ?? yieldRate,
        }));

        addProviderWithAccounts({
          name: targetProviderName,
          accounts,
        });
        return;
      }

      const existingByKey = new Map(targetProvider.accounts.map((a) => [normalizeKey(a.name), a]));

      const usedExistingIds = new Set<string>();
      const nextAccounts = parsed.holdings.map((holding) => {
        const existing = existingByKey.get(normalizeKey(holding.name)) ?? existingByKey.get(holding.key);
        if (existing?.id) {
          usedExistingIds.add(existing.id);
        }
        return buildImportedAccount({
          providerId: targetProvider.id,
          holding,
          accountId: existing?.id,
          existingRateAnnualPct: existing?.rate,
          fallbackRateAnnualPct: yieldRate,
          existingChecklist: existing?.checklist,
          existingNotes: existing?.notes,
        });
      });
      const untouchedAccounts = targetProvider.accounts.filter((account) => !usedExistingIds.has(account.id));

      updateProvider(targetProvider.id, {
        name: targetProviderName,
        // Conserva cuentas existentes que no aparecieron en este archivo importado.
        accounts: [...nextAccounts, ...untouchedAccounts],
      });
    },
    [providers, yieldRate, addProviderWithAccounts, updateProvider]
  );
