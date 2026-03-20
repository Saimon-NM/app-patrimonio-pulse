import { useMemo } from 'react';

export const useTodayLabel = () =>
  useMemo(
    () =>
      new Date().toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    []
  );
