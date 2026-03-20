import type { Provider, Account } from '@/features/accounts/model/provider.types';

const buildAccount = (id: string, data: Omit<Account, 'id'>): Account => ({
  id,
  ...data,
  checklist: data.checklist ?? [],
  notes: data.notes ?? '',
});

export const defaultProviders: Provider[] = [
  {
    id: 'nu',
    name: 'Nu',
    average: 7.98,
    total: '$163k MXN',
    accent: '#6dd6bc',
    accentLabel: '#26c65e',
    accounts: [
      buildAccount('nu-cajita-turbo', {
        name: 'Cajita Turbo',
        desc: 'Disponible · mayor tasa',
        balance: 26710.81,
        rate: 13,
        monthly: 289.37,
      }),
      buildAccount('nu-cajita-normal', {
        name: 'Cajita Normal',
        desc: 'Congelable 180 días · 7.30%',
        balance: 100000.74,
        rate: 7,
        monthly: 583.34,
      }),
      buildAccount('nu-respaldo', {
        name: 'Respaldo · Garantía TDC',
        desc: 'Bloqueado — garantía tarjeta',
        balance: 21771.87,
        rate: 7,
        monthly: 127,
      }),
      buildAccount('nu-cuenta-usar', {
        name: 'Cuenta Usar',
        desc: 'Disponible · gasto corriente',
        balance: 14904.73,
        rate: 7,
        monthly: 86.94,
      }),
    ],
  },
  {
    id: 'didi',
    name: 'DiDi',
    average: 8.06,
    total: '$134k MXN',
    accent: '#2d86f3',
    accentLabel: '#2d86f3',
    accounts: [
      buildAccount('didi-plus', {
        name: 'DiDi Plus',
        desc: 'Tasa preferencial',
        balance: 10000,
        rate: 15,
        monthly: 125,
      }),
      buildAccount('didi-regular', {
        name: 'DiDi Regular',
        desc: 'Saldo restante',
        balance: 124351.2,
        rate: 7.5,
        monthly: 777.2,
      }),
    ],
  },
  {
    id: 'revolut',
    name: 'Revolut',
    average: 8.95,
    total: '$103k MXN',
    accent: '#3cb470',
    accentLabel: '#3cb470',
    accounts: [
      buildAccount('revo-cuenta', {
        name: 'Cuenta Revolut',
        desc: 'Rendimiento automático',
        balance: 102550.42,
        rate: 8.95,
        monthly: 764.86,
      }),
    ],
  },
  {
    id: 'gbm-etfs',
    name: 'GBM — ETFs (largo plazo)',
    average: 8,
    total: '$101k MXN',
    accent: '#8c6d14',
    accentLabel: '#8c6d14',
    accounts: [
      buildAccount('gbm-etfs', {
        name: 'Portafolio ETFs',
        desc: '17 posiciones · SCHD, VYM, DGRO…',
        balance: 100817,
        rate: 8,
        monthly: 672.11,
      }),
    ],
  },
];

export const allocationBreakdown = [
  { name: 'Nu', percent: 32.6, color: '#7a3fde' },
  { name: 'DiDi', percent: 26.8, color: '#2d86f3' },
  { name: 'Revolut', percent: 20.5, color: '#3cb470' },
  { name: 'GBM', percent: 20.1, color: '#c48a1f' },
];
