Actúa como Arquitecto de Software Senior especializado en React + TypeScript, fintech y performance.

Proyecto:
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts
- Vitest + Testing Library
- Helpers personalizados (`finance`, `precision`, `cn`, etc.)

## Objetivo

Tu misión es **detectar bugs reales y corregirlos** con refactor incremental, manteniendo comportamiento visible y APIs existentes.

### Reglas críticas (obligatorias)

1. No romper comportamiento visible de UI.
2. No hacer reescrituras grandes.
3. No cambiar contratos públicos ni props externas.
4. No agregar dependencias innecesarias.
5. Cada cambio debe incluir validación (tests y/o build).

---

## 1) Detección de bugs (con ejecución real)

Revisa el código completo y detecta:

- lógica financiera incorrecta (anual vs mensual, compuesto vs simple)
- problemas de precisión y redondeo (float drift, sumas acumuladas)
- inconsistencias UI vs cálculo (números mostrados vs fuente real)
- errores en gráficas Recharts (series, ejes, porcentajes, leyendas)
- hooks defectuosos (deps, stale closures, derived state duplicado)
- persistencia riesgosa (localStorage: versionado, migración, sanitización)

Prioriza por severidad:
- 🔴 Crítico (riesgo de dinero/datos)
- 🟠 Alto
- 🟡 Medio
- 🔵 Bajo

---

## 2) Corrección automática y segura

Por cada bug encontrado:

- corrígelo directamente en código
- muestra **ANTES** y **DESPUÉS** (solo bloque relevante)
- explica:
  - por qué era bug
  - impacto real
  - por qué el fix es seguro e incremental

No mezcles cambios no relacionados en un mismo fix.

---

## 3) Buenas prácticas (sin sobre-refactor)

Aplica mejoras puntuales:

- separar lógica de UI cuando haya complejidad alta
- reducir duplicación
- reforzar tipado TypeScript
- usar funciones puras en cálculos financieros
- eliminar estado derivado redundante
- centralizar sanitización/validación numérica

---

## 4) Performance

Optimiza donde haya impacto real:

- renders innecesarios
- cálculos repetidos (`useMemo`)
- handlers recreados sin necesidad (`useCallback`)
- memoización de data para Recharts
- evitar trabajo pesado en render

No optimizar prematuramente sin evidencia razonable.

---

## 5) Tailwind/UX consistency

- unificar clases repetidas (usar tokens/helpers cuando aplique)
- asegurar contraste y legibilidad (tema normal/contrastado)
- mantener consistencia visual de inputs financieros y cards

---

## 6) Validación financiera (obligatoria)

Verifica matemáticamente:

- flujo mensual/anual consistente
- uso correcto de tasa anual y conversión periódica
- coherencia entre:
  - capital
  - rendimiento
  - proyección
  - ingreso pasivo

Corregir cualquier desviación detectada.

---

## 7) Tests

Agregar/ajustar tests para:

- funciones financieras críticas
- hooks de proyección/recomendación/persistencia
- regresiones de bugs corregidos

Usar Vitest + Testing Library.

---

## 8) Formato de entrega

Entregar exactamente en este orden:

1. 🔴 Bugs encontrados (priorizados por impacto)
2. 🛠️ Fixes aplicados (ANTES/DESPUÉS + explicación breve)
3. 🟡 Mejoras importantes de arquitectura/código
4. 🟢 Optimizaciones de performance
5. ✅ Evidencia de validación (tests/build/lint)

---

## 9) Criterio de seguridad para fintech

Si hay duda entre “más elegante” vs “más seguro”, prioriza seguridad y trazabilidad.
No introducir cambios ambiguos en cálculos monetarios.

---

## 10) Ejecuta ahora

Analiza el proyecto, corrige bugs reales de forma incremental, valida con tests y entrega el reporte en el formato indicado.