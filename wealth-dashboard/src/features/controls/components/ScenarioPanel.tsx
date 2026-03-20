import type { FC } from 'react';
import type { SavedScenario } from '@/features/controls/hooks/useScenarioManager';
import InfoIcon from '@/shared/components/InfoIcon';

interface ScenarioPanelProps {
  scenarios: SavedScenario[];
  onApply: (scenario: SavedScenario) => void;
  onRemove: (name: string) => void;
}

const ScenarioPanel: FC<ScenarioPanelProps> = ({ scenarios, onApply, onRemove }) => {
  return (
    <article className="glass rounded-3xl border border-white/5 p-5 shadow-xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/50">Escenarios</p>
        <div className="flex items-center gap-1">
          <h3 className="text-lg font-semibold text-white">Escenarios guardados</h3>
          <InfoIcon label="Aplica o elimina configuraciones guardadas" />
        </div>
      </div>
      </div>
      <div className="mt-4 space-y-3">
          {scenarios.length === 0 ? (
            <p className="text-sm text-white/50">Aún no hay escenarios guardados.</p>
          ) : (
            scenarios.map((scenario) => (
              <div
                key={scenario.name}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            >
              <div>
                <p className="font-semibold text-white">{scenario.name}</p>
                <p className="text-[0.65rem] text-white/60">{new Date(scenario.createdAt).toLocaleString()}</p>
              </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onApply(scenario)}
                    className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition hover:border-white/40"
                  >
                    Aplicar
                  </button>
                <button
                  type="button"
                  onClick={() => onRemove(scenario.name)}
                  className="rounded-full border border-red-500 px-3 py-1 text-xs text-red-400 transition hover:bg-red-500/10"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  );
};

export default ScenarioPanel;
