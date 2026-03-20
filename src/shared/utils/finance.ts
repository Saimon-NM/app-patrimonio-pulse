const DAYS_IN_MONTH = 30;
const MONTHS_IN_YEAR = 12;
const DEFAULT_MAX_YEARS = 60;
const DAYS_IN_YEAR = 365;

export type CompoundFrequency = 'monthly' | 'annual';

export interface SimulationInput {
  initialCapital: number;
  monthlyContribution: number;
  annualRate: number;
  target: number;
  compoundingFrequency?: CompoundFrequency;
  inflationRate?: number;
  maxYears?: number;
}

export interface SimulationResult {
  reachedNominal: boolean;
  nominalMonths: number;
  nominalDays: number;
  reachedReal: boolean;
  realMonths: number;
  realDays: number;
  finalNominalCapital: number;
  finalRealCapital: number;
}

export interface TimelinePoint {
  year: number;
  nominal: number;
}

export type TimelineEstimate = {
  years: number;
  months: number;
  days: number;
  reached: boolean;
};

const convertYearsToDuration = (yearsFromStart: number) => {
  const totalDays = Math.max(0, Math.floor(yearsFromStart * DAYS_IN_YEAR));
  const years = Math.floor(totalDays / DAYS_IN_YEAR);
  const months = Math.floor((totalDays % DAYS_IN_YEAR) / DAYS_IN_MONTH);
  const days = (totalDays % DAYS_IN_YEAR) % DAYS_IN_MONTH;
  return { years, months, days };
};

export const calculateTimeline = (points: TimelinePoint[], target: number): TimelineEstimate | null => {
  if (!points?.length || !Number.isFinite(target) || target <= 0) {
    return null;
  }

  const normalizedPoints = [...points].sort((a, b) => a.year - b.year);
  const startYear = normalizedPoints[0].year;

  if (target <= normalizedPoints[0].nominal) {
    return { years: 0, months: 0, days: 0, reached: true };
  }

  for (let index = 1; index < normalizedPoints.length; index += 1) {
    const prev = normalizedPoints[index - 1];
    const current = normalizedPoints[index];
    if (current.nominal >= target) {
      const deltaNominal = current.nominal - prev.nominal;
      const fraction = deltaNominal > 0 ? (target - prev.nominal) / deltaNominal : 0;
      const yearsFromStart =
        (prev.year - startYear) + Math.min(1, Math.max(0, fraction)) * (current.year - prev.year);
      const duration = convertYearsToDuration(yearsFromStart);
      return { ...duration, reached: true };
    }
  }

  const lastPoint = normalizedPoints[normalizedPoints.length - 1];
  const yearsFromStart = lastPoint.year - startYear;
  const duration = convertYearsToDuration(yearsFromStart);
  return { ...duration, reached: false };
};

export const durationToDays = (estimate: TimelineEstimate | null) =>
  estimate ? estimate.years * DAYS_IN_YEAR + estimate.months * DAYS_IN_MONTH + estimate.days : 0;

export const formatDurationFromDays = (daysCount: number) => {
  if (daysCount <= 0) {
    return '0 días';
  }
  const years = Math.floor(daysCount / DAYS_IN_YEAR);
  const months = Math.floor((daysCount % DAYS_IN_YEAR) / DAYS_IN_MONTH);
  const days = (daysCount % DAYS_IN_YEAR) % DAYS_IN_MONTH;
  const parts: string[] = [];
  if (years) {
    parts.push(`${years} ${years === 1 ? 'año' : 'años'}`);
  }
  if (months) {
    parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);
  }
  if (days) {
    parts.push(`${days} ${days === 1 ? 'día' : 'días'}`);
  }
  return parts.join(' ') || '0 días';
};

const toNumber = (value: number) => Number.isFinite(value) ? value : 0;

const deriveMonthsPerPeriod = (frequency: CompoundFrequency) => (frequency === 'annual' ? 12 : 1);

export const annualRateToPeriodicRate = (annualRate: number, periodsPerYear: number) => {
  const safeAnnualRate = toNumber(annualRate);
  const safePeriods = Math.max(1, Math.floor(toNumber(periodsPerYear)));
  return Math.pow(1 + safeAnnualRate / 100, 1 / safePeriods) - 1;
};

const inflationFactor = (rate: number, months: number) => Math.pow(1 + rate / 100, months / MONTHS_IN_YEAR);

export const simulateTimeline = ({
  initialCapital,
  monthlyContribution,
  annualRate,
  target,
  compoundingFrequency = 'monthly',
  inflationRate = 0,
  maxYears = DEFAULT_MAX_YEARS,
}: SimulationInput): SimulationResult => {
  const safeInitial = Math.max(0, toNumber(initialCapital));
  const contribution = Math.max(0, toNumber(monthlyContribution));
  const annualTarget = Math.max(0, toNumber(target));
  const yearsLimit = Math.max(1, toNumber(maxYears));

  if (annualTarget <= 0) {
    return {
      reachedNominal: true,
      nominalMonths: 0,
      nominalDays: 0,
      reachedReal: true,
      realMonths: 0,
      realDays: 0,
      finalNominalCapital: safeInitial,
      finalRealCapital: safeInitial,
    };
  }

  const monthsPerPeriod = deriveMonthsPerPeriod(compoundingFrequency);
  const limitMonths = Math.max(1, Math.floor(yearsLimit * MONTHS_IN_YEAR));
  const monthlyRate = annualRateToPeriodicRate(annualRate, MONTHS_IN_YEAR);
  const periodRate = Math.pow(1 + monthlyRate, monthsPerPeriod) - 1;

  let capital = safeInitial;
  let months = 0;
  let periodCounter = 0;
  let nominalReachedMonth = capital >= annualTarget ? 0 : -1;
  let realReachedMonth = capital >= annualTarget ? 0 : -1;

  while (months < limitMonths && (nominalReachedMonth === -1 || realReachedMonth === -1)) {
    months += 1;

    capital += contribution;
    periodCounter += 1;

    if (periodCounter >= monthsPerPeriod) {
      capital *= 1 + periodRate;
      periodCounter = 0;
    }

    const currentInflation = inflationFactor(inflationRate, months);
    const realCapital = currentInflation > 0 ? capital / currentInflation : capital;

    if (nominalReachedMonth === -1 && capital >= annualTarget) {
      nominalReachedMonth = months;
    }
    if (realReachedMonth === -1 && realCapital >= annualTarget) {
      realReachedMonth = months;
    }
  }

  const nominalResultMonths = nominalReachedMonth === -1 ? limitMonths : nominalReachedMonth;
  const realResultMonths = realReachedMonth === -1 ? limitMonths : realReachedMonth;
  const finalInflation = inflationFactor(inflationRate, months);

  return {
    reachedNominal: nominalReachedMonth !== -1,
    nominalMonths: nominalResultMonths,
    nominalDays: nominalResultMonths * DAYS_IN_MONTH,
    reachedReal: realReachedMonth !== -1,
    realMonths: realResultMonths,
    realDays: realResultMonths * DAYS_IN_MONTH,
    finalNominalCapital: capital,
    finalRealCapital: finalInflation > 0 ? capital / finalInflation : capital,
  };
};

export const validateSimulationConsistency = (
  baseline: SimulationResult,
  scenario: SimulationResult,
  useReal = false
): boolean => {
  const baseReached = useReal ? baseline.reachedReal : baseline.reachedNominal;
  const scenarioReached = useReal ? scenario.reachedReal : scenario.reachedNominal;
  if (!baseReached || !scenarioReached) {
    return false;
  }
  const baseDays = useReal ? baseline.realDays : baseline.nominalDays;
  const scenarioDays = useReal ? scenario.realDays : scenario.nominalDays;
  return scenarioDays >= baseDays;
};

interface CalculateGainOptions {
  round?: boolean;
}

export const calculateMonthlyGain = (
  balance: number,
  annualRate: number,
  options: CalculateGainOptions = {}
): number => {
  if (!balance || !annualRate) {
    return 0;
  }

  const monthly = (balance * annualRate) / 1200;
  if (options.round ?? true) {
    return Math.round((monthly + Number.EPSILON) * 100) / 100;
  }

  return monthly;
};

