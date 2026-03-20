import type { SummarySnapshot } from '@/features/overview/data/summary.data';
import type { DashboardParameters } from '@/features/controls/hooks/useDashboardParameters';

export interface EducationalTip {
  id: string;
  title: string;
  message: string;
}

export const useEducationalTips = (summary: SummarySnapshot, params: DashboardParameters): EducationalTip[] => {
  const tips: EducationalTip[] = [];

  if (summary.monthlyPassive < params.income * 0.25) {
    tips.push({
      id: 'close-saving-gap',
      title: 'Amplía tu ahorro estratégico',
      message: 'Explora cómo subir el ahorro mensual en 5 puntos porcentuales para acercarte a tu meta de flujo pasivo.',
    });
  }

  if (summary.averageYield < params.yieldRate) {
    tips.push({
      id: 'review-yield',
      title: 'Evalúa tus tasas',
      message: 'Tus tasas promedio están por debajo del objetivo ETF; investir en cuentas con mayor rendimiento incrementará el ingreso pasivo.',
    });
  }

  if (params.inflation > 5) {
    tips.push({
      id: 'adjust-for-inflation',
      title: 'Ajusta por inflación',
      message: 'Ajusta tu aportación o tu horizonte si la inflación supera el 5% para asegurar poder adquisitivo real.',
    });
  }

  return tips;
};
