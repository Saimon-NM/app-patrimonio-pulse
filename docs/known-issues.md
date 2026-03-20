# Known issues y deuda tecnica

## Resueltos recientemente
- Sanitizacion defensiva de escenarios leidos desde `localStorage`.
- Sanitizacion de entradas extremas en proyeccion financiera.
- Normalizacion de checklist corrupto en persistencia de cuentas.
- Merge seguro en importacion Excel para evitar perdida de cuentas existentes.
- Inputs numericos vacios ya no fuerzan `0` accidental al editar saldo/tasa.
- Refactor por fases de `App.tsx` ejecutado:
  - `OverviewAndSimulatorSection`
  - `AccountsAndFlowSection` (ya modular)
  - `ChartsSection`
  - `InsightsAndScenariosSection`
  - `useGoalSettingsHandlers`
  - `useExcelImport`
  - `useScenarioSaveFeedback`
- Validacion de equivalencia funcional ejecutada con `build` y tests en verde.
- `AppShellLayout` + `useSettingsMenuState` para extraer layout/header/menu de `App.tsx`.
- Suite smoke/integration base agregada para flujo critico financiero (`src/App.smoke.test.tsx`).
- Retencion de snapshots configurable desde settings (`historyMaxSnapshots`).
- Downsampling en charts para datasets extensos (`useCapitalChartSeries`, `DividendsChart`).
- Modelo neto inicial con fricciones configurables: impuestos, comisiones y slippage.

## Pendientes vigentes
- Extender smoke tests con casos negativos (import fallido, datos corruptos en storage, limites extremos de tasas).
- Afinar modelo neto para diferenciar impuestos por tipo de instrumento/cuenta (hoy es descuento global agregado).
