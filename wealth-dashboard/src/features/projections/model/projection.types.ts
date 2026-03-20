export interface ProjectionPoint {
  year: number;
  nominal: number;
  real: number;
}

export interface ProjectionInput {
  currentCapital: number;
  contribution: number;
  horizon: number;
  yieldRate: number;
  dividendYield: number;
  inflation: number;
}

export interface DividendRecord {
  year: number;
  mensual: number;
  anual: number;
  acumulado: number;
  monthlyBreakdown: number[];
}

export interface ProjectionResult {
  capitalPoints: ProjectionPoint[];
  baselinePoints: ProjectionPoint[];
  dividendRecords: DividendRecord[];
  passiveMonthlyEstimate: number;
}
