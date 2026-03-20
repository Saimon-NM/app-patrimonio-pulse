import type { Account } from '@/features/providers/model/provider.types';

export interface SimulationPreset {
  id: string;
  label: string;
  description: string;
  applyAccount: (account: Account) => Account;
}

export const simulationPresets: SimulationPreset[] = [
  {
    id: 'boost-rate-12',
    label: 'Duplicar tasa a 12%',
    description: 'Eleva tu tasa efectiva hasta 12% para ver el impacto en ingresos pasivos.',
    applyAccount: (account) => ({
      ...account,
      rate: Math.max(account.rate, 12),
    }),
  },
  {
    id: 'reduce-balance-20',
    label: 'Reducir saldo 20%',
    description: 'Simula retirar el 20% del capital para ver cómo reaccionan flujos.',
    applyAccount: (account) => ({
      ...account,
      balance: account.balance * 0.8,
    }),
  },
];
