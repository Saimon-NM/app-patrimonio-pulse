import { useMemo } from 'react';
import { formatCurrencyWithIndicator } from '@/shared/utils/precision';

interface SavingPalette {
  badge: string;
  messageBox: string;
  trackColor: string;
}

export interface SavingStatusResult {
  savingPercent: number;
  savingStatus: string;
  savingMessage: string;
  savingPalette: SavingPalette;
  targetStatement: string;
}

export const useSavingStatus = (income: number, contribution: number): SavingStatusResult =>
  useMemo(() => {
    const savingPercent = income > 0 ? (contribution / income) * 100 : 0;

    const minTarget = income * 0.1;
    const idealTarget = income * 0.2;
    const aggressiveTarget = income * 0.3;

    const savingStatus =
      savingPercent < 10 ? 'Por debajo del mínimo' : savingPercent < 25 ? 'En línea con el objetivo' : 'Excelente';

    const savingMessage =
      savingPercent >= 50
        ? '⚠️ Estás destinando más del 50% de tu ingreso a ahorro: verifica que sea sostenible.'
        : savingPercent >= 30
        ? '🎯 Gran ritmo: mantén la disciplina y monitorea nuevas oportunidades.'
        : '📈 Ajusta hacia el ideal para acercarte a tus metas sin sacrificar liquidez.';

    const savingPalette: SavingPalette =
      savingPercent >= 50
        ? {
            badge: 'border-red-500/60 bg-red-500/10 text-red-300',
            messageBox: 'border-red-500/30 bg-red-500/10',
            trackColor: '#ff4c4c',
          }
        : savingPercent >= 30
        ? {
            badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
            messageBox: 'border-emerald-500/30 bg-emerald-500/10',
            trackColor: '#22c55e',
          }
        : {
            badge: 'border-amber-400/50 bg-amber-400/10 text-amber-200',
            messageBox: 'border-amber-500/30 bg-amber-500/10',
            trackColor: '#f97316',
          };

    const targetStatement = `Con ${formatCurrencyWithIndicator(income)} MXN: mínimo ${formatCurrencyWithIndicator(
      minTarget
    )} · ideal ${formatCurrencyWithIndicator(idealTarget)} · agresivo ${formatCurrencyWithIndicator(
      aggressiveTarget
    )} MXN/mes.`;

    return {
      savingPercent,
      savingStatus,
      savingMessage,
      savingPalette,
      targetStatement,
    };
  }, [contribution, income]);
