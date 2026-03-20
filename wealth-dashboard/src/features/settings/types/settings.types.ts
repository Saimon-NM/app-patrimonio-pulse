export interface CurrencyConfig {
  code: string;
  symbol: string;
  rateToMxn: number;
}

export type ThemeMode = 'dark' | 'contrast';

export interface GoalConfig {
  id: string;
  title: string;
  amount: number;
}

export interface AppSettings {
  usdRate: number;
  currencies: CurrencyConfig[];
  theme: ThemeMode;
  goals: GoalConfig[];
  activeGoalId: string;
  /** Inflación anual de referencia (solo informativa) para marcar en los controles del simulador */
  inflationReference: number;
  /** Tope de snapshots a conservar en historial */
  historyMaxSnapshots: number;
  /** Descuento anual estimado por impuestos sobre rendimiento */
  taxRatePct: number;
  /** Fricción anual estimada por comisiones de operación/mantenimiento */
  commissionRatePct: number;
  /** Fricción anual estimada por slippage/ejecución */
  slippageRatePct: number;
}

export const DEFAULT_GOALS: GoalConfig[] = [
  { id: 'goal-default', title: 'Meta principal', amount: 7_690_000 },
];

export const DEFAULT_SETTINGS: AppSettings = {
  usdRate: 17.8,
  theme: 'dark',
  currencies: [
    { code: 'USD', symbol: '$', rateToMxn: 17.8 },
    { code: 'EUR', symbol: '€', rateToMxn: 19.4 },
    { code: 'GBP', symbol: '£', rateToMxn: 22.1 },
  ],
  goals: DEFAULT_GOALS,
  activeGoalId: DEFAULT_GOALS[0].id,
  inflationReference: 4,
  historyMaxSnapshots: 50,
  taxRatePct: 0,
  commissionRatePct: 0,
  slippageRatePct: 0,
};
