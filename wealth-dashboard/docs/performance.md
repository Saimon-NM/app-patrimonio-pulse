# Performance

## Optimizaciones aplicadas
- Derivaciones financieras encapsuladas en hooks y `useMemo`.
- Componentes de cuenta/proveedor memoizados (`React.memo`) para reducir renders.
- Dependencias de memo en proyeccion simplificadas a primitivos.
- Recalculo de `monthly` a partir de `balance/rate` para coherencia.

## Riesgos actuales
- `App.tsx` centraliza mucha orquestacion.
- Render de charts y paneles puede crecer con datasets masivos.
- Todo corre en main thread.

## Recomendaciones siguientes (incrementales)
1. Medir con React Profiler interacciones de sliders y edicion de cuentas.
2. Partir `App.tsx` en secciones contenedoras por dominio.
3. Debounce opcional en controles de alta frecuencia si hay jitter.
4. Evaluar virtualizacion/decimacion si se extiende horizonte o puntos de serie.
