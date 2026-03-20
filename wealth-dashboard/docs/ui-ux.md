# UI/UX

## Principios actuales
- Tema oscuro por defecto y modo contrastado opcional.
- Prioridad a legibilidad de datos financieros (saldo, tasa, ingreso pasivo).
- Feedback inmediato en acciones criticas (importar, snapshots, historial, checklist).

## Reglas visuales activas
- Inputs financieros usan base comun `financialInputBase` (`shared/styles/tokens.ts`).
- Formatos numericos obligatorios:
  - moneda: `formatCurrencyWithIndicator`
  - porcentaje: `formatPercentWithIndicator`
- Evitar texto de baja legibilidad en modo contrastado.

## Accesibilidad y contraste
- Existe soporte para `theme-contrast` con bordes/texto reforzados.
- Recomendacion: validar cada nueva pantalla en ambos temas antes de merge.

## Patrones UX financieros
- Mostrar contexto de calculo donde hay recomendaciones automaticas.
- Evitar acciones destructivas sin confirmacion.
- Mantener mensajes de error cortos y accionables ("Ingresa un monto valido > 0").

## Checklist para nuevos componentes
- El componente no debe ocultar ni redondear en exceso valores de dinero.
- Debe respetar tema dark/contrast sin degradar bordes ni placeholders.
- Debe evitar cambios de estado no intencionales por inputs temporales vacios.
