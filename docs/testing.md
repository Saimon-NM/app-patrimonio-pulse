# Estrategia de testing

El proyecto usa `Vitest + Testing Library`.

## Cobertura actual (alto impacto)
- Utilidades financieras: `shared/utils/finance.test.ts`.
- Proyeccion: `features/projections/hooks/useCapitalProjection.test.tsx`.
- Recomendaciones: `features/insights/hooks/useReallocationRecommendations.test.ts`.
- Importacion Excel: `features/portfolio/services/excelImportService.test.ts`.
- Persistencia robusta: `features/portfolio/services/providerStorageService.test.ts`.
- Escenarios: `features/controls/hooks/useScenarioManager.test.tsx`.
- UI critica de cuentas: `features/accounts/components/AccountCard.test.tsx`.

## Criterios de calidad obligatorios
- Todo cambio en calculos monetarios requiere test de regresion.
- Toda lectura de `localStorage` debe validar shape y sanear datos.
- Valores no finitos (`NaN`, `Infinity`) no deben llegar al render financiero.
- No aceptar cambios de comportamiento sin test que lo documente.

## Comandos
- Ejecutar tests: `npm run test -- --run`
- Build de validacion: `npm run build`

## Deuda pendiente recomendada
- Agregar smoke/integration tests de flujo completo:
  - editar saldo -> proyeccion -> recomendaciones -> snapshot.
- Agregar pruebas de UI para tema contrastado y legibilidad minima.
