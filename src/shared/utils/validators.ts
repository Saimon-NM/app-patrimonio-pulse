export interface NumberSanitizerOptions {
  min?: number;
  max?: number;
  fallback?: number;
}

export const MAX_BALANCE = 1e12;
export const MAX_RATE_PCT = 100;
export const MAX_MAX_BALANCE = 1e12;

export const sanitizeNumber = (value: number, options: NumberSanitizerOptions = {}) => {
  const candidate = Number(value);
  if (!Number.isFinite(candidate)) {
    return options.fallback ?? 0;
  }
  let safeValue = candidate;
  if (options.min != null) {
    safeValue = Math.max(safeValue, options.min);
  }
  if (options.max != null) {
    safeValue = Math.min(safeValue, options.max);
  }
  return safeValue;
};
