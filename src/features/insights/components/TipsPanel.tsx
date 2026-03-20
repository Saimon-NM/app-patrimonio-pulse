import type { FC } from 'react';
import CardBase from '@/shared/components/ui/CardBase';
import type { EducationalTip } from '@/features/insights/hooks/useEducationalTips';

interface TipsPanelProps {
  tips: EducationalTip[];
}

const TipsPanel: FC<TipsPanelProps> = ({ tips }) => {
  if (!tips.length) {
    return null;
  }

  return (
    <CardBase className="space-y-3 border-white/20 bg-black/40">
      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/60">Panel educativo</p>
        <h3 className="text-lg font-semibold text-white">Tips dinámicos</h3>
      </div>
      <div className="grid gap-3">
        {tips.map((tip) => (
          <CardBase key={tip.id} className="border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">{tip.title}</p>
            <p className="text-xs text-white/60">{tip.message}</p>
          </CardBase>
        ))}
      </div>
    </CardBase>
  );
};

export default TipsPanel;
