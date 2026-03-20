import { useCallback, useState } from 'react';

type ScenarioSaveStatus = 'idle' | 'saving' | 'saved';

export const useScenarioSaveFeedback = (saveScenario: (name: string) => void) => {
  const [scenarioSaveStatus, setScenarioSaveStatus] = useState<ScenarioSaveStatus>('idle');
  const [scenarioSaveMessage, setScenarioSaveMessage] = useState<string | null>(null);

  const handleSaveScenario = useCallback(() => {
    const name = prompt('Nombre del escenario');
    if (name) {
      const trimmed = name.trim();
      if (!trimmed) return;

      setScenarioSaveStatus('saving');
      try {
        saveScenario(trimmed);
        setScenarioSaveStatus('saved');
        setScenarioSaveMessage(`Escenario "${trimmed}" guardado`);
      } finally {
        window.setTimeout(() => {
          setScenarioSaveStatus('idle');
          setScenarioSaveMessage(null);
        }, 1600);
      }
    }
  }, [saveScenario]);

  return {
    scenarioSaveStatus,
    scenarioSaveMessage,
    handleSaveScenario,
  };
};
