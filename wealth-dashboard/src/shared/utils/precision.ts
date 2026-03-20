import { formatCurrency } from '@/shared/services/currencyFormatter';

const DECIMAL_TOLERANCE = 1e-6;

const computeHasExtraDecimals = (value: number, decimals: number) => {
  if (!Number.isFinite(value)) {
    return false;
  }
  const factor = 10 ** decimals;
  const truncated = Math.trunc(value * factor) / factor;
  return Math.abs(value - truncated) > DECIMAL_TOLERANCE;
};

export const hasExtraDecimals = (value: number, decimals = 2) => computeHasExtraDecimals(value, decimals);

export const approxSuffix = (value: number, decimals = 2) =>
  hasExtraDecimals(value, decimals) ? ' ~' : '';

export const formatCurrencyWithIndicator = (value: number) =>
  `${formatCurrency(value)}${approxSuffix(value, 2)}`;

export const formatPercentWithIndicator = (value: number, decimals = 2) =>
  `${value.toFixed(decimals)}%${approxSuffix(value, decimals)}`;

export const formatNumberWithIndicator = (value: number, decimals = 2) =>
  `${value.toFixed(decimals)}${approxSuffix(value, decimals)}`;

export const formatShortCurrency = (value: number) => {
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M MXN`;
  }
  if (absValue >= 1000) {
    return `${(value / 1000).toFixed(1)}k MXN`;
  }
  return `${value.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN`;
};
