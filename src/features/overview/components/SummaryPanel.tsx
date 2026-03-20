import type { FC } from 'react';
import type { CurrencyConfig } from '@/features/settings/types/settings.types';
import { formatCurrencyWithIndicator, formatNumberWithIndicator } from '@/shared/utils/precision';
import Card from '@/shared/components/ui/Card';
import AllocationBar from '@/shared/components/AllocationBar';
import InfoIcon from '@/shared/components/InfoIcon';
import StatItem from '@/shared/components/ui/StatItem';
import type { StatItemProps } from '@/shared/components/ui/StatItem';
import Badge from '@/shared/components/ui/Badge';

export interface MetricCard {
  label: string;
  value: string;
  description?: string;
  tone?: NonNullable<StatItemProps['tone']>;
}

interface AllocationItem {
  name: string;
  percent: number;
  color: string;
}

interface OverviewSummaryProps {
  summary: {
    total: number;
    monthlyPassive: number;
    annualPassive: number;
    averageYield: number;
  };
  allocation: AllocationItem[];
  metricCards: MetricCard[];
  usdRate: number;
  currencies: CurrencyConfig[];
  className?: string;
}

const OverviewSummary: FC<OverviewSummaryProps> = ({
  summary,
  allocation,
  metricCards,
  usdRate,
  currencies,
  className,
}) => {
  const totalUSD = usdRate > 0 ? summary.total / usdRate : 0;

  return (
    <Card
      as="section"
      label="Resumen patrimonio"
      className={[ 'mb-0', className ?? '' ].filter(Boolean).join(' ')}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/60">Resumen patrimonio</p>
          <h1 className="text-3xl font-semibold text-white">${summary.total.toLocaleString('en-US')}</h1>
          <p className="text-sm text-white/50">Saldo consolidado</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-white/50">
          <InfoIcon label="Suma de todos tus saldos en MXN y USD" />
          <span>
            ~{formatNumberWithIndicator(totalUSD)} USD · TC {usdRate}
          </span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {metricCards.map((card) => (
          <StatItem
            key={card.label}
            label={card.label}
            value={card.value}
            description={card.description}
            tone={card.tone}
          />
        ))}
      </div>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/50">Distribución</p>
            <p className="text-sm text-white/70">Tu patrimonio por proveedor</p>
          </div>
          <InfoIcon label="Revisa cómo se reparte tu capital" />
        </div>
        <div className="space-y-3">
          <AllocationBar items={allocation} />
          <div className="flex flex-wrap gap-2 text-xs text-white/70">
            {allocation.map((item) => (
              <Badge
                key={item.name}
                className="gap-2 rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em]"
                textColor={item.color}
                borderColor={`${item.color}40`}
                dotColor={item.color}
              >
                <span className="font-semibold">{item.name}</span>
                <span className="text-white/60">{item.percent.toFixed(1)}%</span>
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {currencies.map((currency) => {
          const converted = currency.rateToMxn > 0 ? summary.total / currency.rateToMxn : 0;
          return (
            <div key={currency.code} className="rounded-2xl border border-white/10 px-3 py-2 text-white/70">
              <div className="flex items-center justify-between text-[0.6rem] uppercase tracking-[0.3em] text-white/50">
                <span>{currency.code}</span>
                <span>{currency.symbol}</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-white">
                {currency.symbol}
                {formatNumberWithIndicator(converted)}
              </p>
              <p className="text-[0.65rem] text-white/40">
                {formatCurrencyWithIndicator(currency.rateToMxn)} MXN · 1 {currency.code}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default OverviewSummary;
