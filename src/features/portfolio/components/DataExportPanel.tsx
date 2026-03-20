import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import type { Provider } from '@/features/accounts/model/provider.types';
import type { DividendRecord, ProjectionPoint } from '@/features/projections/model/projection.types';

type DataExportPanelProps = {
  providers: Provider[];
  capitalPoints: ProjectionPoint[];
  baselinePoints: ProjectionPoint[];
  dividendRecords: DividendRecord[];
};

const escapeCsvCell = (value: string) => `"${value.replaceAll('"', '""')}"`;

const formatCsvNumber = (value: number) => {
  if (!Number.isFinite(value)) return '0';
  // Excel (ES) suele esperar coma decimal si usas `;` como separador.
  return value.toFixed(2).replace('.', ',');
};

const toShortDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: '2-digit' });
};

const downloadTextFile = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const applySheetLayout = (worksheet: XLSX.WorkSheet, columns: number[]) => {
  worksheet['!cols'] = columns.map((wch) => ({ wch }));
  const range = XLSX.utils.decode_range(worksheet['!ref'] ?? 'A1:A1');
  worksheet['!autofilter'] = {
    ref: XLSX.utils.encode_range({
      s: { c: 0, r: 0 },
      e: { c: range.e.c, r: Math.max(range.e.r, 0) },
    }),
  };
};

const applyNumberFormatByColumns = (
  worksheet: XLSX.WorkSheet,
  columns: number[],
  format: string,
  startRow = 2
) => {
  const ref = worksheet['!ref'];
  if (!ref) return;
  const range = XLSX.utils.decode_range(ref);
  for (const col of columns) {
    for (let row = startRow - 1; row <= range.e.r; row += 1) {
      const addr = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[addr];
      if (!cell || typeof cell.v !== 'number') continue;
      cell.z = format;
    }
  }
};

const yoyPct = (current: number, previous: number) => {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

const downloadXlsxFile = (filename: string, payload: DataExportPanelProps) => {
  const { headers, rows } = buildExportRows(payload);
  const accountRows = rows.filter((row) => row[0] === 'CUENTA');
  const projectionRows = rows.filter((row) => row[0] === 'PROYECCION');

  const totalBalance = payload.providers.reduce(
    (providerSum, provider) =>
      providerSum + provider.accounts.reduce((acc, account) => acc + account.balance, 0),
    0
  );
  const totalMonthly = payload.providers.reduce(
    (providerSum, provider) =>
      providerSum + provider.accounts.reduce((acc, account) => acc + account.monthly, 0),
    0
  );
  const weightedRate = totalBalance
    ? payload.providers.reduce(
        (providerSum, provider) =>
          providerSum + provider.accounts.reduce((acc, account) => acc + account.balance * account.rate, 0),
        0
      ) / totalBalance
    : 0;
  const lastProjection = projectionRows.length
    ? (projectionRows[projectionRows.length - 1] as Array<string | number>)
    : null;
  const horizonNominal = Number(lastProjection?.[7] ?? 0);
  const horizonReal = Number(lastProjection?.[8] ?? 0);
  const nominalGrowthPct = totalBalance > 0 ? ((horizonNominal - totalBalance) / totalBalance) * 100 : 0;
  const cagr =
    totalBalance > 0 && horizonNominal > 0 && projectionRows.length > 1
      ? (Math.pow(horizonNominal / totalBalance, 1 / (projectionRows.length - 1)) - 1) * 100
      : 0;

  const summaryRows: Array<Array<string | number>> = [
    ['Patrimonio Pulse - Resumen de exportación'],
    ['Fecha exportación', toShortDate(new Date().toISOString())],
    [''],
    ['KPI', 'Valor'],
    ['Capital total actual (MXN)', totalBalance],
    ['Capital nominal al horizonte (MXN)', horizonNominal],
    ['Capital real al horizonte (MXN)', horizonReal],
    ['Crecimiento nominal al horizonte (%)', nominalGrowthPct],
    ['CAGR estimado (%)', cagr],
    ['Ingreso pasivo mensual actual (MXN)', totalMonthly],
    ['Ingreso pasivo anual actual (MXN)', totalMonthly * 12],
    ['Rendimiento promedio ponderado anual (%)', weightedRate],
    [''],
    ['Sugerencia', 'Usa la hoja "Datos_graficos" para insertar gráficos en Excel (línea/área).'],
  ];

  const cuentasSheetData = [headers, ...accountRows];
  const proyeccionSheetData = [headers, ...projectionRows];
  const chartDataRows: Array<Array<string | number>> = [['anio', 'capital_nominal', 'capital_real', 'baseline_nominal', 'dividendo_mensual', 'dividendo_acumulado', 'var_nominal_yoy_pct', 'var_real_yoy_pct']];
  projectionRows.forEach((row, index) => {
    const prev = index > 0 ? projectionRows[index - 1] : null;
    const nominal = Number(row[7] ?? 0);
    const real = Number(row[8] ?? 0);
    const prevNominal = Number(prev?.[7] ?? 0);
    const prevReal = Number(prev?.[8] ?? 0);
    chartDataRows.push([
      row[3] as number,
      nominal,
      real,
      Number(row[9] ?? 0),
      Number(row[11] ?? 0),
      Number(row[13] ?? 0),
      index === 0 ? 0 : yoyPct(nominal, prevNominal),
      index === 0 ? 0 : yoyPct(real, prevReal),
    ]);
  });

  const topByBalance = [...accountRows]
    .sort((a, b) => Number(b[4] ?? 0) - Number(a[4] ?? 0))
    .slice(0, 5);
  const topByMonthly = [...accountRows]
    .sort((a, b) => Number(b[6] ?? 0) - Number(a[6] ?? 0))
    .slice(0, 5);
  const rankingRows: Array<Array<string | number>> = [
    ['Top 5 cuentas por saldo'],
    ['proveedor', 'cuenta', 'saldo_mxn', 'tasa_anual_pct', 'ganancia_mensual_mxn'],
    ...topByBalance.map((r) => [r[1], r[2], Number(r[4] ?? 0), Number(r[5] ?? 0), Number(r[6] ?? 0)]),
    [''],
    ['Top 5 cuentas por ganancia mensual'],
    ['proveedor', 'cuenta', 'saldo_mxn', 'tasa_anual_pct', 'ganancia_mensual_mxn'],
    ...topByMonthly.map((r) => [r[1], r[2], Number(r[4] ?? 0), Number(r[5] ?? 0), Number(r[6] ?? 0)]),
  ];

  const integrityRows: Array<Array<string | number>> = [
    ['Check', 'Valor'],
    ['Filas cuentas', accountRows.length],
    ['Filas proyección', projectionRows.length],
    ['Años proyectados', projectionRows.length],
    ['Total actual (suma cuentas)', totalBalance],
    ['Total mensual (suma cuentas)', totalMonthly],
    ['Capital horizonte nominal', horizonNominal],
    ['Capital horizonte real', horizonReal],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  const cuentasSheet = XLSX.utils.aoa_to_sheet(cuentasSheetData);
  const proyeccionSheet = XLSX.utils.aoa_to_sheet(proyeccionSheetData);
  const chartDataSheet = XLSX.utils.aoa_to_sheet(chartDataRows);
  const rankingSheet = XLSX.utils.aoa_to_sheet(rankingRows);
  const integritySheet = XLSX.utils.aoa_to_sheet(integrityRows);

  applySheetLayout(summarySheet, [48, 30]);
  applySheetLayout(cuentasSheet, [14, 20, 24, 8, 14, 14, 22, 14, 14, 14, 14, 14, 14, 16, 14]);
  applySheetLayout(proyeccionSheet, [14, 20, 24, 8, 14, 14, 22, 14, 14, 14, 14, 14, 14, 16, 14]);
  applySheetLayout(chartDataSheet, [10, 18, 16, 18, 16, 18, 16, 16]);
  applySheetLayout(rankingSheet, [24, 24, 16, 16, 20]);
  applySheetLayout(integritySheet, [34, 20]);

  applyNumberFormatByColumns(summarySheet, [1], '#,##0.00');
  applyNumberFormatByColumns(cuentasSheet, [4, 6], '#,##0.00');
  applyNumberFormatByColumns(cuentasSheet, [5], '0.00"%"');
  applyNumberFormatByColumns(proyeccionSheet, [7, 8, 9, 10, 11, 12, 13], '#,##0.00');
  applyNumberFormatByColumns(chartDataSheet, [1, 2, 3, 4, 5], '#,##0.00');
  applyNumberFormatByColumns(chartDataSheet, [6, 7], '0.00"%"');
  applyNumberFormatByColumns(rankingSheet, [2, 4], '#,##0.00');
  applyNumberFormatByColumns(rankingSheet, [3], '0.00"%"');

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
  XLSX.utils.book_append_sheet(workbook, cuentasSheet, 'Cuentas');
  XLSX.utils.book_append_sheet(workbook, proyeccionSheet, 'Proyeccion');
  XLSX.utils.book_append_sheet(workbook, chartDataSheet, 'Datos_graficos');
  XLSX.utils.book_append_sheet(workbook, rankingSheet, 'Ranking');
  XLSX.utils.book_append_sheet(workbook, integritySheet, 'Integridad');
  XLSX.writeFile(workbook, filename);
};

const buildExportRows = ({
  providers,
  capitalPoints,
  baselinePoints,
  dividendRecords,
}: DataExportPanelProps) => {
  const headers = [
    'tipo',
    'proveedor',
    'cuenta',
    'anio',
    'saldo_mxn',
    'tasa_anual_pct',
    'ganancia_mensual_estimada_mxn',
    'capital_nominal',
    'capital_real',
    'baseline_nominal',
    'baseline_real',
    'dividendo_mensual',
    'dividendo_anual',
    'dividendo_acumulado',
    'fecha_export',
  ];

  const nowIso = new Date().toISOString();
  const exportDate = toShortDate(nowIso);
  const dividendByYear = new Map<number, DividendRecord>();
  dividendRecords.forEach((d) => dividendByYear.set(d.year, d));

  const rows: Array<Array<string | number>> = [];

  providers.forEach((provider) => {
    provider.accounts.forEach((account) => {
      rows.push([
        'CUENTA',
        provider.name,
        account.name,
        '',
        account.balance,
        account.rate,
        account.monthly,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        exportDate,
      ]);
    });
  });

  const maxLen = Math.max(capitalPoints.length, baselinePoints.length);
  for (let i = 0; i < maxLen; i += 1) {
    const cp = capitalPoints[i];
    const bp = baselinePoints[i];
    if (!cp && !bp) continue;
    const year = cp?.year ?? bp?.year ?? i;
    const div = dividendByYear.get(year);

    rows.push([
      'PROYECCION',
      '',
      '',
      year,
      '',
      '',
      '',
      cp?.nominal ?? 0,
      cp?.real ?? 0,
      bp?.nominal ?? 0,
      bp?.real ?? 0,
      div?.mensual ?? 0,
      div?.anual ?? 0,
      div?.acumulado ?? 0,
      exportDate,
    ]);
  }

  return { headers, rows };
};

const buildCombinedExportCsv = ({
  providers,
  capitalPoints,
  baselinePoints,
  dividendRecords,
}: DataExportPanelProps) => {
  const { headers, rows } = buildExportRows({ providers, capitalPoints, baselinePoints, dividendRecords });
  const allRows = [
    headers,
    ...rows.map((row) =>
      row.map((cell) =>
        typeof cell === 'number' ? formatCsvNumber(cell) : cell
      )
    ),
  ];
  const csv = allRows
    .map((row) =>
      row
        .map((cell) => {
          if (cell === '') return '';
          // Conservamos números con coma decimal sin comillas para que Excel los reconozca mejor.
          const looksNumeric = /^-?\d+(,\d+)?$/.test(cell);
          return looksNumeric ? cell : escapeCsvCell(cell);
        })
        .join(';')
    )
    .join('\r\n');

  // BOM para que Excel abra bien UTF-8.
  return `\uFEFF${csv}`;
};

const DataExportPanel = ({ providers, capitalPoints, baselinePoints, dividendRecords }: DataExportPanelProps) => {
  const [toast, setToast] = useState<string | null>(null);

  const payload = useMemo(
    () => ({ providers, capitalPoints, baselinePoints, dividendRecords }),
    [providers, capitalPoints, baselinePoints, dividendRecords]
  );

  const onExport = () => {
    try {
      const formatRaw = window.prompt(
        'Formato de exportación:\n- csv\n- xlsx',
        'csv'
      );
      if (!formatRaw) return;
      const format = formatRaw.trim().toLowerCase();
      const baseName = `patrimonio-pulse_export_${new Date().toISOString().slice(0, 10)}`;

      if (format === 'xlsx' || format === 'excel') {
        downloadXlsxFile(`${baseName}.xlsx`, payload);
        setToast('Exportación Excel lista');
      } else if (format === 'csv') {
        const csv = buildCombinedExportCsv(payload);
        downloadTextFile(`${baseName}.csv`, csv);
        setToast('Exportación CSV lista');
      } else {
        setToast('Formato no válido (usa csv o xlsx)');
      }
    } catch (e) {
      setToast('No se pudo exportar');
      console.warn('[DataExportPanel] export failed', e);
    } finally {
      window.setTimeout(() => setToast(null), 1400);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onExport}
        className="rounded-full border border-cyan-500/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200 transition hover:bg-cyan-500/10"
        aria-label="Exportar datos"
      >
        Exportar
      </button>
      {toast ? (
        <span className="text-xs text-white/60" role="status" aria-live="polite">
          {toast}
        </span>
      ) : null}
    </div>
  );
};

export default DataExportPanel;

