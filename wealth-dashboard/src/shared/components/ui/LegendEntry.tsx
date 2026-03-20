import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

export interface LegendEntryProps {
  color: string;
  label: string;
  description?: string;
  className?: string;
}

const LegendEntry = ({
  color,
  label,
  description,
  className,
  ...rest
}: LegendEntryProps & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex items-start gap-3 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/70',
      className
    )}
    {...rest}
  >
    <span
      className="mt-0.5 h-2 w-2 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
    <div>
      <p className="font-semibold text-white">{label}</p>
      {description ? <p className="text-[0.65rem] text-white/60">{description}</p> : null}
    </div>
  </div>
);

export default LegendEntry;
