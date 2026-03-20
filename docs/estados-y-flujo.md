# Estado y flujo

## Fuentes de verdad
- `useProvidersState`: providers y cuentas (CRUD + persistencia).
- `useDashboardParameters`: parametros del simulador.
- `useAppSettings`: metas, tema, monedas y ajustes globales.
- `useBalanceHistory`: snapshots historicos manuales.

## Derivaciones
- `useFinancialSummary`: total, pasivo mensual/anual, rendimiento promedio.
- `useCapitalProjection`: series nominal/real y dividendos proyectados.
- `useReallocationRecommendations`: sugerencias de rebalanceo con base filtrada.

## Flujo principal
1. Usuario modifica saldo/tasa/parametro.
2. Se sanitiza entrada y se actualiza estado fuente.
3. Hooks derivados recalculan resumen/proyeccion/recomendaciones.
4. Componentes de UI renderizan datos formateados.
5. Estado persistente se guarda en `localStorage` versionado.

## Guardrails actuales
- Limites numericos para balance, tasa, maxBalance, horizon e inflation.
- Normalizacion de datos leidos desde storage.
- Evitar updates monetarios accidentales por inputs vacios.
