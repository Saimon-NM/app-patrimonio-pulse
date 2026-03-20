import { render, screen } from '@testing-library/react';
import OverviewSummary, { type MetricCard } from './SummaryPanel';

describe('OverviewSummary', () => {
  const metricCards: MetricCard[] = [
    {
      label: 'Ingreso pasivo / mes',
      value: '$100.00',
      tone: 'success',
    },
  ];

  const props = {
    summary: {
      total: 1000,
      monthlyPassive: 100,
      annualPassive: 1200,
      averageYield: 12,
    },
    allocation: [
      { name: 'Nu', percent: 50, color: '#000' },
      { name: 'DiDi', percent: 50, color: '#111' },
    ],
    metricCards,
    usdRate: 20,
    currencies: [
      { code: 'USD', symbol: '$', rateToMxn: 20 },
    ],
  };

  it('renders metric cards and allocation badges', () => {
    render(<OverviewSummary {...props} />);
    expect(screen.getByText('Ingreso pasivo / mes')).toBeInTheDocument();
    expect(screen.getByText('Nu')).toBeInTheDocument();
    expect(screen.getAllByText('50.0%')).toHaveLength(2);
    expect(screen.getByText('USD')).toBeInTheDocument();
  });
});
