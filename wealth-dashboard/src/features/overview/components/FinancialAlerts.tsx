import type { FC } from 'react';
import Badge from '@/shared/components/ui/Badge';
import type { FinancialAlert } from '@/features/overview/hooks/useFinancialAlerts';

interface FinancialAlertsProps {
  alerts: FinancialAlert[];
}

const severityColor: Record<FinancialAlert['severity'], string> = {
  warning: '#f97316',
  info: '#38bdf8',
};

const FinancialAlerts: FC<FinancialAlertsProps> = ({ alerts }) => {
  if (!alerts.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/60">Alertas financieras</p>
      <div className="flex flex-wrap gap-2">
        {alerts.map((alert) => (
          <Badge
            key={alert.id}
            className="gap-2 rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em]"
            textColor={severityColor[alert.severity]}
            borderColor={`${severityColor[alert.severity]}55`}
            dotColor={severityColor[alert.severity]}
          >
            {alert.message}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default FinancialAlerts;
