import type { DashboardParameters } from '@/features/controls/hooks/useDashboardParameters';
import type { SummarySnapshot } from '@/features/overview/data/summary.data';

export interface FinancialAlert {
  id: string;
  message: string;
  severity: 'info' | 'warning';
}

export const useFinancialAlerts = (
  summary: SummarySnapshot,
  params: DashboardParameters,
  goal: number
): FinancialAlert[] => {
  const alerts: FinancialAlert[] = [];

  if (summary.total < goal * 0.5) {
    alerts.push({
      id: 'low-capital',
      severity: 'warning',
      message: 'Tu capital está muy por debajo de la meta. Revisa aportaciones o tasas.',
    });
  }

  if (summary.monthlyPassive < params.income * 0.05) {
    alerts.push({
      id: 'low-passive',
      severity: 'warning',
      message: 'El ingreso pasivo representa menos del 5% del ingreso mensual.',
    });
  }

  if (summary.averageYield < params.yieldRate) {
    alerts.push({
      id: 'yield-gap',
      severity: 'info',
      message: 'El rendimiento promedio está por debajo del objetivo ETF. Reevalúa tasas.',
    });
  }

  return alerts;
};
