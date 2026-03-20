import { useMemo } from 'react';
import { useProvidersState } from './features/portfolio/hooks/useProvidersState';
import { useFinancialSummary } from './features/overview/hooks/useFinancialSummary';
import { useTodayLabel } from './features/overview/hooks/useTodayLabel';
import { useAllocationBreakdown } from './features/accounts/hooks/useAllocationBreakdown';
import { useSavingStatus } from './features/controls/hooks/useSavingStatus';
import { formatCurrencyWithIndicator } from './shared/utils/precision';
import { useDashboardParameters } from './features/controls/hooks/useDashboardParameters';
import { useCapitalProjection } from './features/projections/hooks/useCapitalProjection';
import { useFinancialInsights } from './features/insights/hooks/useFinancialInsights';
import { useScenarioManager } from './features/controls/hooks/useScenarioManager';
import { useScenarioSaveFeedback } from './features/controls/hooks/useScenarioSaveFeedback';
import { useAppSettings } from './features/settings/hooks/useAppSettings';
import { sanitizeNumber } from './shared/utils/validators';
import { useGoalImpact } from './features/portfolio/hooks/useGoalImpact';
import { useAccountsController } from './features/accounts/hooks/useAccountsController';
import { useDashboardViewModel } from './features/overview/hooks/useDashboardViewModel';
import { useBalanceHistory } from './features/portfolio/hooks/useBalanceHistory';
import BalanceUpdateReminderBanner from './features/portfolio/components/BalanceUpdateReminderBanner';
import AccountsAndFlowSection from '@/features/accounts/components/AccountsAndFlowSection';
import OverviewAndSimulatorSection from '@/features/overview/components/OverviewAndSimulatorSection';
import InsightsAndScenariosSection from '@/features/insights/components/InsightsAndScenariosSection';
import ChartsSection from '@/features/charts/components/ChartsSection';
import { useGoalSettingsHandlers } from '@/features/settings/hooks/useGoalSettingsHandlers';
import { useExcelImport } from '@/features/portfolio/hooks/useExcelImport';
import { useSettingsMenuState } from '@/features/settings/hooks/useSettingsMenuState';
import AppShellLayout from '@/shared/components/AppShellLayout';

const App = () => {
  const { menuOpen, closeMenu, toggleMenu } = useSettingsMenuState();

  const { params, setParams } = useDashboardParameters();
  const {
    settings,
    updateUsdRate,
    updateCurrency,
    addCurrency,
    removeCurrency,
    updateGoalAmount,
    updateGoalTitle,
    addGoal,
    removeGoal,
    setActiveGoal,
    updateTheme,
    updateInflationReference,
    updateHistoryMaxSnapshots,
    updateTaxRatePct,
    updateCommissionRatePct,
    updateSlippageRatePct,
  } = useAppSettings();
  const {
    providers,
    updateAccount,
    updateProvider,
    addAccount,
    addProvider,
    addProviderWithAccounts,
    removeAccount,
    removeProvider,
  } = useProvidersState();

  const summary = useFinancialSummary(providers);
  const netYieldRate = Math.max(
    0,
    params.yieldRate - (settings.taxRatePct + settings.commissionRatePct + settings.slippageRatePct)
  );

  const { history, addSnapshot, clearHistory, removeSnapshot, lastRecordedAt } = useBalanceHistory({
    totalBalance: summary.total,
    monthlyPassive: summary.monthlyPassive,
    maxSnapshots: settings.historyMaxSnapshots,
  });

  const { capitalPoints, baselinePoints, projectedPassiveMonthly, currentPassiveMonthly, dividendRecords } =
    useCapitalProjection({
      currentCapital: summary.total,
      contribution: params.contribution,
      horizon: params.horizon,
      yieldRate: netYieldRate,
      dividendYield: summary.averageYield,
      inflation: params.inflation,
    });
  const {
    decoratedGoals,
    metricCards,
    summaryStats,
    goalTimelines,
  } = useDashboardViewModel({
    summary,
    goals: settings.goals,
    activeGoalId: settings.activeGoalId,
    capitalPoints,
  });

  const goalDelayInfo = useGoalImpact({
    goals: decoratedGoals,
    totalCapital: summary.total,
    params,
  });

  const activeGoalForInsights = useMemo(() => {
    return settings.goals.find((goal) => goal.id === settings.activeGoalId) ?? settings.goals[0];
  }, [settings.goals, settings.activeGoalId]);

  const activeGoalAmountForInsights = activeGoalForInsights?.amount ?? 0;
  const goalLabelForInsights = `${activeGoalForInsights?.title ?? 'Meta principal'} · ${formatCurrencyWithIndicator(
    activeGoalAmountForInsights
  )} MXN`;

  const insights = useFinancialInsights({
    capitalPoints,
    passiveMonthlyEstimate: projectedPassiveMonthly,
    goal: activeGoalAmountForInsights,
  });

  const { scenarios, saveScenario, apply, removeScenario } = useScenarioManager(params, setParams);
  const { scenarioSaveStatus, scenarioSaveMessage, handleSaveScenario } =
    useScenarioSaveFeedback(saveScenario);

  const allocationBreakdown = useAllocationBreakdown(providers);
  const todayLabel = useTodayLabel();
  const { savingPercent, savingStatus, savingMessage, savingPalette, targetStatement } = useSavingStatus(
    params.income,
    params.contribution
  );

  const handleSliderChange = (field: keyof typeof params) => (value: number) => {
    const fallback = typeof params[field] === 'number' ? params[field] : 0;
    const safeValue = sanitizeNumber(value, {
      fallback,
      min: 0,
    });
    setParams({ [field]: safeValue });
  };

  const accountsController = useAccountsController({
    providers,
    updateAccount,
    updateProvider,
    addAccount,
    removeAccount,
    removeProvider,
    addProvider,
    defaultAnnualRate: netYieldRate,
  });
  const handleImportExcel = useExcelImport({
    providers,
    yieldRate: netYieldRate,
    addProviderWithAccounts,
    updateProvider,
  });

  const {
    handleGoalAmountChange,
    handleGoalTitleChange,
    handleAddGoal,
    handleRemoveGoal,
    handleSelectGoal,
  } = useGoalSettingsHandlers({
    activeGoalAmount: activeGoalAmountForInsights,
    updateGoalAmount,
    updateGoalTitle,
    addGoal,
    removeGoal,
    setActiveGoal,
  });


  const themeClass = settings.theme === 'contrast' ? 'theme-contrast' : 'theme-dark';

  return (
    <AppShellLayout
      themeClass={themeClass}
      todayLabel={todayLabel}
      menuOpen={menuOpen}
      onToggleMenu={toggleMenu}
      onCloseMenu={closeMenu}
      settingsModal={{
        settings,
        onUsdRateChange: updateUsdRate,
        onInflationReferenceChange: updateInflationReference,
        onHistoryMaxSnapshotsChange: updateHistoryMaxSnapshots,
        onTaxRatePctChange: updateTaxRatePct,
        onCommissionRatePctChange: updateCommissionRatePct,
        onSlippageRatePctChange: updateSlippageRatePct,
        goals: settings.goals,
        activeGoalId: settings.activeGoalId,
        onGoalAmountChange: handleGoalAmountChange,
        onGoalTitleChange: handleGoalTitleChange,
        onAddGoal: handleAddGoal,
        onRemoveGoal: handleRemoveGoal,
        onSelectGoal: handleSelectGoal,
        onUpdateCurrency: updateCurrency,
        onAddCurrency: addCurrency,
        onRemoveCurrency: removeCurrency,
        onThemeChange: updateTheme,
      }}
    >
      <BalanceUpdateReminderBanner
        lastSnapshotRecordedAt={lastRecordedAt}
        onRegisterSnapshot={addSnapshot}
      />
      <OverviewAndSimulatorSection
        summary={summary}
        allocationBreakdown={allocationBreakdown}
        metricCards={metricCards}
        settings={settings}
        summaryStats={summaryStats}
        params={params}
        savingPercent={savingPercent}
        savingStatus={savingStatus}
        savingMessage={savingMessage}
        savingPalette={savingPalette}
        targetStatement={targetStatement}
        onHandleSliderChange={handleSliderChange}
        onHandleSaveScenario={handleSaveScenario}
        scenarioSaveStatus={scenarioSaveStatus}
        scenarioSaveMessage={scenarioSaveMessage}
      />
      <InsightsAndScenariosSection
        goalLabelForInsights={goalLabelForInsights}
        insights={insights}
        providers={providers}
        scenarios={scenarios}
        onApplyScenario={apply}
        onRemoveScenario={removeScenario}
        summaryTotal={summary.total}
        goalTimelines={goalTimelines}
        goalDelayInfo={goalDelayInfo}
        activeGoalId={settings.activeGoalId}
      />
      <ChartsSection
        capitalPoints={capitalPoints}
        baselinePoints={baselinePoints}
        decoratedGoals={decoratedGoals}
        activeGoalId={settings.activeGoalId}
        currentCapital={summary.total}
        dividendRecords={dividendRecords}
        currentPassiveMonthly={currentPassiveMonthly}
      />
      <AccountsAndFlowSection
        providers={providers}
        yieldRate={params.yieldRate}
        capitalPoints={capitalPoints}
        baselinePoints={baselinePoints}
        dividendRecords={dividendRecords}
        onAddProvider={accountsController.addProvider}
        onImportExcel={handleImportExcel}
        onAccountChange={accountsController.onAccountChange}
        onAccountMetaChange={accountsController.onAccountMetaChange}
        onAddAccount={accountsController.onAddAccount}
        onProviderColorChange={accountsController.onProviderColorChange}
        onRemoveAccount={accountsController.confirmAndRemoveAccount}
        onRemoveProvider={accountsController.confirmAndRemoveProvider}
        onProviderUpdate={accountsController.onProviderUpdate}
        history={history}
        currentBalance={summary.total}
        onRegisterSnapshot={addSnapshot}
        onClearHistory={clearHistory}
        onRemoveSnapshot={removeSnapshot}
      />
    </AppShellLayout>
  );
};

export default App;
