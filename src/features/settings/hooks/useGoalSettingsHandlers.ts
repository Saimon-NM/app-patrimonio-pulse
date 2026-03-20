import { useCallback } from 'react';
import { sanitizeNumber } from '@/shared/utils/validators';

interface UseGoalSettingsHandlersInput {
  activeGoalAmount: number;
  updateGoalAmount: (goalId: string, amount: number) => void;
  updateGoalTitle: (goalId: string, title: string) => void;
  addGoal: (goal: { id: string; title: string; amount: number }) => void;
  removeGoal: (goalId: string) => void;
  setActiveGoal: (goalId: string) => void;
}

export const useGoalSettingsHandlers = ({
  activeGoalAmount,
  updateGoalAmount,
  updateGoalTitle,
  addGoal,
  removeGoal,
  setActiveGoal,
}: UseGoalSettingsHandlersInput) => {
  const handleGoalAmountChange = useCallback(
    (goalId: string, value: number) => {
      const safeValue = sanitizeNumber(value, {
        fallback: activeGoalAmount,
        min: 0,
      });
      updateGoalAmount(goalId, safeValue);
    },
    [activeGoalAmount, updateGoalAmount]
  );

  const handleGoalTitleChange = useCallback(
    (goalId: string, title: string) => {
      updateGoalTitle(goalId, title);
    },
    [updateGoalTitle]
  );

  const handleAddGoal = useCallback(() => {
    addGoal({
      id: `goal-${Date.now()}`,
      title: 'Nueva meta',
      amount: activeGoalAmount,
    });
  }, [activeGoalAmount, addGoal]);

  const handleRemoveGoal = useCallback(
    (goalId: string) => {
      removeGoal(goalId);
    },
    [removeGoal]
  );

  const handleSelectGoal = useCallback(
    (goalId: string) => {
      setActiveGoal(goalId);
    },
    [setActiveGoal]
  );

  return {
    handleGoalAmountChange,
    handleGoalTitleChange,
    handleAddGoal,
    handleRemoveGoal,
    handleSelectGoal,
  };
};
