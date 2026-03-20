import type { HTMLAttributes } from 'react';
import CardBase from './ui/CardBase';
import { cn } from '@/shared/utils/cn';

interface GoalTileProps extends HTMLAttributes<HTMLElement> {
  title: string;
  amount: number;
  percent: number;
  timelineLabel: string;
  delayLabel: string;
  progressColor: string;
  isActive?: boolean;
  messages?: string[];
}

const GoalTile = ({
  title,
  amount,
  percent,
  timelineLabel,
  delayLabel,
  progressColor,
  isActive,
  messages = [],
  className,
  ...rest
}: GoalTileProps) => (
  <CardBase className={cn('p-4 text-xs text-white/70', className)} {...rest}>
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-[0.65rem] text-white/50">Meta {amount ? formatCurrency(amount) : 'sin monto definido'}</p>
      </div>
      <div className="text-right">
        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-white/50">
          {percent.toFixed(1)}%
        </span>
        {isActive && (
          <div className="mt-1 rounded-full border border-white/40 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.3em] text-white">
            Activa
          </div>
        )}
      </div>
    </div>
    <div className="mt-3 h-1.5 rounded-full bg-white/10">
      <div
        className="h-full transition-all duration-300"
        style={{
          width: `${percent}%`,
          backgroundColor: progressColor,
        }}
      />
    </div>
    <div className="mt-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-[0.75rem] font-semibold text-white">{timelineLabel}</p>
        <p className="text-[0.65rem] text-emerald-300">{delayLabel}</p>
      </div>
    </div>
    {messages.length > 0 && (
      <div className="mt-2 space-y-1 text-[0.63rem] text-emerald-300">
        {messages.map((message) => (
          <p key={message}>{message}</p>
        ))}
      </div>
    )}
  </CardBase>
);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);

export default GoalTile;
