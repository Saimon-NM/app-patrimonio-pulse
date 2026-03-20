# Stack Tecnologico

Estado actual del stack usado en `wealth-dashboard`.

## Core
- `react` `^18.3.1`: UI declarativa y hooks.
- `typescript` `~5.9.3`: contratos estrictos para datos financieros.
- `vite` `^8.0.0`: dev server y build.

## UI y visualizacion
- `tailwindcss` `^3.4.7`: sistema visual utilitario.
- `recharts` `^3.8.0`: graficas de proyeccion y dividendos.
- Tema soportado: `theme-dark` y `theme-contrast` desde `style.css`.

## Datos e importacion
- `xlsx` `^0.18.5`: importacion de holdings desde Excel (`.xlsx`, `.xls`).
- Persistencia local: `localStorage` versionado en servicios de providers e historial.

## Testing y calidad
- `vitest` `^4.1.0`: runner principal.
- `@testing-library/react` y `@testing-library/jest-dom`: pruebas de hooks/componentes.
- `tsc` en build: validacion de tipos en cada compilacion de produccion.

## Decisiones clave
- Arquitectura feature-based en `src/features/*`.
- Logica financiera centralizada en hooks/utilidades testeables.
- Sanitizacion de entradas monetarias y tasas con limites explicitos (`validators.ts`).
