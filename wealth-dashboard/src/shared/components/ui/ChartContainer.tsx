import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import LegendGroup from './LegendGroup';
import type { LegendEntryProps } from './LegendEntry';

interface ChartContainerProps {
  title: string;
  description?: string;
  legendEntries?: LegendEntryProps[];
  headerActions?: ReactNode;
  className?: string;
  children: ReactNode;
}

const ChartContainer = ({
  title,
  description,
  legendEntries,
  headerActions,
  className,
  children,
}: ChartContainerProps) => (
  <section
    className={cn(
      'glass flex min-h-[360px] flex-col rounded-3xl border border-white/10 bg-black/40 p-6 shadow-2xl',
      className
    )}
  >
    <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Gráfico</p>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description ? <p className="text-sm text-white/60">{description}</p> : null}
      </div>
      {headerActions ? <div className="flex gap-2">{headerActions}</div> : null}
    </div>
    {legendEntries?.length ? <LegendGroup entries={legendEntries} /> : null}
    <div className="mt-2 flex min-h-0 flex-col">{children}</div>
  </section>
);

export default ChartContainer;
