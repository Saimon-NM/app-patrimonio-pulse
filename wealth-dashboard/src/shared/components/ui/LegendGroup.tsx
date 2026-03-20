import LegendEntry, { type LegendEntryProps } from './LegendEntry';
import { cn } from '@/shared/utils/cn';

interface LegendGroupProps {
  entries: LegendEntryProps[];
  className?: string;
}

const LegendGroup = ({ entries, className }: LegendGroupProps) => (
  <div className={cn('mt-4 grid gap-3 text-xs text-white/70 sm:grid-cols-2', className)}>
    {entries.map((entry) => (
      <LegendEntry key={entry.label} {...entry} />
    ))}
  </div>
);

export default LegendGroup;
