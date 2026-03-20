# Funcionalidades actuales

## 1) Cuentas y posiciones (providers/accounts)
- Alta/edicion/eliminacion de proveedores y cuentas.
- Campos financieros por cuenta:
  - saldo
  - tasa anual
  - maximo a meter (opcional)
  - incluir en recomendaciones
- Checklist por cuenta y notas.

## 2) Importacion y exportacion
- Importacion Excel (`.xlsx`/`.xls`) con parseo regional de numeros.
- Merge seguro con cuentas existentes al importar.
- Exportacion de datos y series para analisis externo.

## 3) Resumen financiero
- Capital total.
- Ingreso pasivo mensual/anual.
- Rendimiento promedio ponderado.

## 4) Proyeccion
- Proyeccion nominal y real por horizonte.
- Serie baseline para comparar "con aportes" vs "sin aportes".
- Registros de dividendos anuales y mensualizados.

## 5) Recomendaciones de rebalanceo
- Sugiere cuentas para aumentar/reducir con base en retorno incremental por MXN.
- Respeta `includeInRecommendations` y `maxBalance`.
- Muestra base de calculo (incluidas/excluidas).

## 6) Historial y snapshots
- Snapshots manuales de balance e ingreso pasivo.
- Historial persistido localmente con versionado.

## 7) Configuracion
- Tema oscuro / contrastado.
- Monedas y tipo de cambio.
- Gestion de metas financieras y escenarios.
