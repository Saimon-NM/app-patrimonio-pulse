import { useEffect, useRef, useState } from 'react';
import {
  clearBalanceHistoryStorage,
  readBalanceHistoryFromStorage,
  saveBalanceHistory,
  takeBalanceSnapshot,
  type BalanceSnapshot,
} from '@/features/portfolio/services/balanceHistoryService';

type UseBalanceHistoryInput = {
  totalBalance: number;
  monthlyPassive: number;
  maxSnapshots?: number;
};

const defaultInputs = {
  maxSnapshots: 50,
};

const formatSignature = (totalBalance: number, monthlyPassive: number) =>
  `${totalBalance.toFixed(2)}|${monthlyPassive.toFixed(2)}`;

export const useBalanceHistory = ({ totalBalance, monthlyPassive, maxSnapshots }: UseBalanceHistoryInput) => {
  const resolvedMax = maxSnapshots ?? defaultInputs.maxSnapshots;

  const [history, setHistory] = useState<BalanceSnapshot[]>(() => readBalanceHistoryFromStorage());

  const lastSignatureRef = useRef<string | null>(null);

  // Inicializamos la firma con el último snapshot existente para mantener referencia de estado actual.
  useEffect(() => {
    if (!history.length) return;
    lastSignatureRef.current = formatSignature(
      history[history.length - 1].totalBalance,
      history[history.length - 1].monthlyPassive
    );
  }, [history]);

  const totalsSignature = formatSignature(totalBalance, monthlyPassive);

  const addSnapshot = () => {
    const nowSig = totalsSignature;

    const snapshot = takeBalanceSnapshot({ totalBalance, monthlyPassive });

    setHistory((prev) => {
      const next = [...prev, snapshot];
      // Máximo para no inflar localStorage.
      if (next.length > resolvedMax) {
        return next.slice(next.length - resolvedMax);
      }
      return next;
    });

    lastSignatureRef.current = nowSig;
  };

  const clearHistory = () => {
    clearBalanceHistoryStorage();
    setHistory([]);
    lastSignatureRef.current = null;
  };

  const removeSnapshot = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  // Persistimos cada cambio.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveBalanceHistory(history);
  }, [history]);

  // Modo 100% manual: nunca agregamos snapshots automáticamente.
  useEffect(() => {
    lastSignatureRef.current = totalsSignature;
  }, [totalsSignature]);

  return {
    history,
    addSnapshot,
    clearHistory,
    removeSnapshot,
    lastRecordedAt: history.length ? history[history.length - 1].recordedAt : null,
  };
};

