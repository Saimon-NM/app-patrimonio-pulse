import type { FC } from 'react';
import CardBase from './CardBase';

export interface StatItemProps {
  label: string;
  value: string;
  description?: string;
  tone?: 'primary' | 'success' | 'accent';
}

const toneStyles: Record<NonNullable<StatItemProps['tone']>, string> = {
  primary: 'text-white',
  success: 'text-emerald-300',
  accent: 'text-sky-300',
};

const StatItem: FC<StatItemProps> = ({ label, value, description, tone = 'primary' }) => (
  <CardBase className="p-4 bg-white/5 shadow-inner transition hover:-translate-y-0.5 hover:border-white/30">
    <div className="flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/50">
      <span>{label}</span>
      {description && <span className="text-[0.65rem] text-white/50">{description}</span>}
    </div>
    <p className={`text-lg font-semibold ${toneStyles[tone]}`}>{value}</p>
  </CardBase>
);

export default StatItem;
