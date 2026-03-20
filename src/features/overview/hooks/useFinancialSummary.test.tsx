import { render } from '@testing-library/react';
import type { Provider } from '@/features/providers/model/provider.types';
import { defaultSummary, type SummarySnapshot } from '@/features/overview/data/summary.data';
import { useFinancialSummary } from './useFinancialSummary';

const providers: Provider[] = [
  {
    id: 'nu',
    name: 'Nu',
    average: 0,
    total: '$0 MXN',
    accent: '#000000',
    accentLabel: '#000000',
    accounts: [
      {
        id: 'nu-1',
        name: 'Cuenta 1',
        desc: 'Desc',
        balance: 1000,
        rate: 10,
        monthly: 0,
      },
    ],
  },
];

describe('useFinancialSummary', () => {
  it('sums balances and income', () => {
    let receivedSummary: SummarySnapshot = defaultSummary;
    const Test = () => {
      receivedSummary = useFinancialSummary(providers);
      return null;
    };

    render(<Test />);
    expect(receivedSummary.total).toBe(1000);
    expect(receivedSummary.monthlyPassive).toBeCloseTo((1000 * 10) / 1200);
    expect(receivedSummary.annualPassive).toBeCloseTo(((1000 * 10) / 1200) * 12);
  });

  it('returns defaults when no providers are provided', () => {
    let receivedSummary: SummarySnapshot = defaultSummary;

    const Test = () => {
      receivedSummary = useFinancialSummary([]);
      return null;
    };

    render(<Test />);

    expect(receivedSummary.total).toBe(defaultSummary.total);
    expect(receivedSummary.monthlyPassive).toBe(defaultSummary.monthlyPassive);
    expect(receivedSummary.annualPassive).toBe(defaultSummary.annualPassive);
    expect(receivedSummary.averageYield).toBe(defaultSummary.averageYield);
  });

  it('preserves explicit zero balances instead of falling back to demo defaults', () => {
    let receivedSummary: SummarySnapshot = defaultSummary;

    const Test = () => {
      receivedSummary = useFinancialSummary([
        {
          id: 'empty',
          name: 'Empty',
          average: 0,
          total: '$0 MXN',
          accent: '#000000',
          accentLabel: '#000000',
          accounts: [
            {
              id: 'empty-1',
              name: 'Cuenta vacia',
              desc: 'Sin saldo',
              balance: 0,
              rate: 0,
              monthly: 0,
            },
          ],
        },
      ]);
      return null;
    };

    render(<Test />);

    expect(receivedSummary.total).toBe(0);
    expect(receivedSummary.monthlyPassive).toBe(0);
    expect(receivedSummary.annualPassive).toBe(0);
    expect(receivedSummary.averageYield).toBe(defaultSummary.averageYield);
  });
});
