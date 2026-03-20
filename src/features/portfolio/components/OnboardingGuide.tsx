import { useEffect, useMemo, useState } from 'react';

const DISMISSED_KEY = 'patrimonio-onboarding-inline-dismissed';

const readDismissed = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
};

const writeDismissed = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DISMISSED_KEY, 'true');
};

const STEPS: Array<{ title: string; body: string }> = [
  {
    title: 'Agrega tus cuentas',
    body: 'Usa “Agregar cuenta” para crear posiciones. Cada cuenta representa una estrategia o ETF.',
  },
  {
    title: 'Completa saldo y tasa',
    body: 'Define el saldo actual y la tasa anual. La ganancia mensual estimada se calcula automáticamente.',
  },
  {
    title: 'Revisa proyección y dividendos',
    body: 'En los gráficos verás la evolución del capital y los dividendos estimados en el tiempo.',
  },
  {
    title: 'Ajusta metas y simulador',
    body: 'Las metas determinan el timeline. Cambia ingreso mensual / aportación y mira el impacto.',
  },
];

export default function OnboardingGuide() {
  const [dismissed, setDismissed] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setDismissed(readDismissed());
  }, []);

  const current = useMemo(() => STEPS[stepIndex] ?? STEPS[0], [stepIndex]);
  const atLast = stepIndex >= STEPS.length - 1;

  if (dismissed) return null;

  return (
    <aside className="rounded-3xl border border-white/10 bg-black/30 p-5 shadow-2xl">
      <p className="text-xs uppercase tracking-[0.4em] text-white/40">Guía rápida</p>
      <h3 className="mt-1 text-lg font-semibold text-white">{current.title}</h3>
      <p className="mt-2 text-sm text-white/60">{current.body}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">{`Paso ${stepIndex + 1} / ${STEPS.length}`}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (atLast) {
                writeDismissed();
                setDismissed(true);
                return;
              }
              setStepIndex((s) => Math.min(s + 1, STEPS.length - 1));
            }}
            className="rounded-full border border-cyan-500/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200 transition hover:bg-cyan-500/10"
          >
            {atLast ? 'Entendido' : 'Siguiente'}
          </button>
          <button
            type="button"
            onClick={() => {
              writeDismissed();
              setDismissed(true);
            }}
            className="rounded-full border border-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-white/30"
          >
            Cerrar
          </button>
        </div>
      </div>
    </aside>
  );
}

