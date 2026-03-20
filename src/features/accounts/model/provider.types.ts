export interface Account {
  id: string;
  name: string;
  desc: string;
  balance: number;
  rate: number;
  /**
   * Máximo de dinero (MXN) que puedes “meter” en esta posición.
   * Si no existe (undefined), se asume que no tiene tope.
   */
  maxBalance?: number;
  /**
   * Si está en `false`, esta posición no participa en las recomendaciones
   * (para simular “¿y si puedo mover desde aquí?” sin sugerir esa cuenta).
   */
  includeInRecommendations?: boolean;
  monthly: number;
  checklist?: { id: string; label: string; done: boolean }[];
  notes?: string;
}

export interface Provider {
  id: string;
  name: string;
  average: number;
  total: string;
  accent: string;
  accentLabel: string;
  accounts: Account[];
  isNew?: boolean;
}
