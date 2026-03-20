# Arquitectura del proyecto

## Enfoque
- Arquitectura por features en `src/features/*`.
- Capa compartida en `src/shared/*` (UI reutilizable, utilidades, tokens).
- Flujo de datos unidireccional: hooks -> componentes presentacionales.

## Capas principales
- **UI**: componentes en `components/`.
- **Estado y orquestacion**: hooks (`useProvidersState`, `useBalanceHistory`, `useScenarioManager`).
- **Dominio financiero**: utilidades (`shared/utils/finance.ts`, `validators.ts`, `precision.ts`).
- **Persistencia local**: servicios (`providerStorageService`, `balanceHistoryService`).

## Decisiones actuales importantes
- Persistencia versionada para providers e historial.
- Normalizacion de datos al leer storage para evitar corrupcion en runtime.
- Sanitizacion defensiva en entradas monetarias, tasas y parametros de proyeccion.
- Recomendaciones separadas en hook puro (`useReallocationRecommendations`).

## Punto de atencion
- `App.tsx` sigue siendo un coordinador grande; conviene continuar extrayendo secciones por dominio para reducir acoplamiento.
