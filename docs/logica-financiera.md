# Logica financiera (critico)

Cambios en esta area requieren test de regresion.

## Calculos base
- Ingreso mensual por cuenta:
  - `monthly = (balance * rate) / 1200`
- Resumen global:
  - `totalBalance = suma(balance)`
  - `monthlyPassive = suma(calculateMonthlyGain(balance, rate, { round: false }))`
  - `averageYield` ponderado por saldo.

## Proyeccion
- Hook principal: `features/projections/hooks/useCapitalProjection.ts`.
- Supuesto operativo:
  - aporte mensual se suma y luego aplica rendimiento mensual efectivo.
- Consistencia de tasa:
  - crecimiento y dividendos usan `yieldRate`.

## Inflacion
- Capital real = nominal / factor de inflacion acumulado.
- El input de inflacion esta sanitizado para evitar valores invalidos extremos.

## Sanitizacion y limites
- `balance`: `0 .. 1e12`
- `rate`: `0 .. 100`
- `maxBalance`: `0 .. 1e12`
- proyeccion:
  - `horizon`: `1 .. 80`
  - `inflation`: `-99 .. 100`
  - `contribution`: `>= 0`

## Importacion Excel
- Soporta formatos regionales mixtos:
  - `1,234`, `1.234`, `1,234.56`, `1.234,56`.
- Merge seguro:
  - al importar sobre proveedor existente no se pierden cuentas no presentes en el archivo.

## Supuestos fintech importantes
- Rendimientos mostrados son brutos (sin impuestos, comisiones ni slippage).
- Las recomendaciones son heuristicas de retorno incremental por MXN.
- Los snapshots de balance son manuales (no automaticos).
