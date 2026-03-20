import type { ProjectionPoint } from '@/features/projections/model/projection.types';

interface InsightInput {
  capitalPoints: ProjectionPoint[];
  passiveMonthlyEstimate: number;
  goal: number;
}

interface FinancialInsights {
  finalNominal: number;
  finalReal: number;
  percentToGoal: number;
  suggestion: string;
  passiveMonthlyEstimate: number;
  passiveAnnualEstimate: number;
}

const CLAMP_PERCENT = (value: number) => Math.min(100, Math.max(0, value));

export const useFinancialInsights = ({
  capitalPoints,
  passiveMonthlyEstimate,
  goal,
}: InsightInput): FinancialInsights => {
  const latest = capitalPoints[capitalPoints.length - 1];
  const finalNominal = latest?.nominal ?? goal;
  const finalReal = latest?.real ?? goal;

  const percentToGoal = goal > 0 ? CLAMP_PERCENT((finalNominal / goal) * 100) : 0;
  const suggestion =
    percentToGoal < 50
      ? 'Incrementa tu aportación o busca oportunidades con mayor rendimiento para acortar la brecha.'
      : percentToGoal < 90
      ? 'Vas por buen camino: mantén disciplina y revisa tus inversiones cada 6 meses.'
      : 'Meta casi alcanzada: considera proteger ganancias o ajustar el horizonte.';

  return {
    finalNominal,
    finalReal,
    percentToGoal,
    suggestion,
    passiveMonthlyEstimate,
    passiveAnnualEstimate: passiveMonthlyEstimate * 12,
  };
};
