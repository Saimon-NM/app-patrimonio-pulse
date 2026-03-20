import type { Account, Provider } from '@/features/accounts/model/provider.types';
import FinancialChecklist from './FinancialChecklist';

interface GlobalChecklistPanelProps {
  providers: Provider[];
  onAccountMetaChange: (providerId: string, accountId: string, updates: Partial<Account>) => void;
}

const GlobalChecklistPanel = ({ providers, onAccountMetaChange }: GlobalChecklistPanelProps) => {
  return <FinancialChecklist providers={providers} onAccountMetaChange={onAccountMetaChange} />;
};

export default GlobalChecklistPanel;
