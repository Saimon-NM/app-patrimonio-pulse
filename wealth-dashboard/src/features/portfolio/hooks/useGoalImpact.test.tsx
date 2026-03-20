import { render } from '@testing-library/react';
import type { GoalConfig } from '@/features/settings/types/settings.types';
import type { DashboardParameters } from '@/features/controls/hooks/useDashboardParameters';
import type { GoalImpactDetail } from './useGoalImpact';
import { useGoalImpact } from './useGoalImpact';

describe('useGoalImpact', () => {

  const goals: GoalConfig[] = [
    { id: 'moto', title: 'Moto', amount: 100000 },
    { id: 'casa', title: 'Casa', amount: 500000 },
    { id: 'retiro', title: 'Retirarme', amount: 5000000 },
  ];

  const params: DashboardParameters = {
    income: 20000,
    contribution: 5000,
    yieldRate: 10,
    horizon: 20,
    inflation: 3,
    compoundingFrequency: 'monthly',
  };

  it('reports delays between goals when one is purchased', () => {
    let impact: Record<string, GoalImpactDetail> | null = null;

    const Test = () => {
      impact = useGoalImpact({ goals, totalCapital: 501271.46, params });
      return null;
    };

    render(<Test />);

    if (!impact) {
      throw new Error('hook result not initialized');
    }

    const motoImpact = impact['moto'] as GoalImpactDetail;
    const casaImpact = impact['casa'] as GoalImpactDetail;

    expect(motoImpact).toBeDefined();
    expect(motoImpact.otherDelays.some((delay) => delay.title === 'Casa')).toBe(true);

    expect(casaImpact).toBeDefined();
    expect(casaImpact.otherDelays.some((delay) => delay.title === 'Moto')).toBe(true);
    expect(casaImpact.ownDelay).not.toBeNull();
  });
});

