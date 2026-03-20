import * as XLSX from 'xlsx';
import { calculateMonthlyGain } from '@/shared/utils/finance';
import { sanitizeNumber, MAX_BALANCE, MAX_RATE_PCT } from '@/shared/utils/validators';

export type ImportedAppKey = 'gbm' | 'unknown';

export type ExcelHolding = {
  app: ImportedAppKey;
  key: string; // stable key for matching existing accounts
  name: string; // display name
  balance: number; // MXN
  desc?: string;
  // Optional; GBM export sample doesn't include yield. If undefined we keep existing rate.
  rateAnnualPct?: number;
};

type ParseResult = {
  app: ImportedAppKey;
  providerName: string;
  holdings: ExcelHolding[];
};

const normalizeText = (value: string) =>
  value
    .toString()
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

/**
 * Parsea números de Excel soportando formatos regionales.
 * Exportado para pruebas unitarias.
 */
export const parseExcelNumber = (raw: unknown): number => {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  if (raw == null) return 0;

  const s = String(raw).trim();
  if (!s) return 0;

  const cleaned = s.replace(/[^\d\-.,]/g, '');
  if (!cleaned) return 0;

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  const hasComma = lastComma !== -1;
  const hasDot = lastDot !== -1;

  let normalized: string;
  if (hasComma && hasDot) {
    const decimalIsComma = lastComma > lastDot;
    normalized = decimalIsComma
      ? cleaned.replace(/\./g, '').replace(',', '.')
      : cleaned.replace(/,/g, '');
  } else if (hasComma && !hasDot) {
    const afterComma = cleaned.slice(lastComma + 1);
    const digitsAfterComma = afterComma.replace(/\D/g, '').length;
    if (digitsAfterComma === 3 && afterComma.length === 3) {
      normalized = cleaned.replace(/,/g, '');
    } else {
      normalized = cleaned.replace(',', '.');
    }
  } else if (hasDot && !hasComma) {
    const parts = cleaned.split('.');
    const lastPart = parts[parts.length - 1] ?? '';
    if ((parts.length > 2 || (parts.length === 2 && lastPart.length === 3)) && /^\d+$/.test(lastPart)) {
      normalized = cleaned.replace(/\./g, '');
    } else {
      normalized = cleaned;
    }
  } else {
    normalized = cleaned;
  }

  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
};

const parsePercent = (raw: unknown): number | undefined => {
  if (raw == null) return undefined;
  const s = String(raw).trim();
  if (!s) return undefined;
  // Remove % sign.
  const cleaned = s.replace('%', '');
  const n = parseExcelNumber(cleaned);
  if (!Number.isFinite(n)) return undefined;

  // Heuristic: if it's like 0.035 => convert to percent.
  return n > 0 && n < 1 ? n * 100 : n;
};

const detectAppFromFilename = (fileName: string): ImportedAppKey => {
  const f = normalizeText(fileName);
  if (f.includes('GBM')) return 'gbm';
  return 'unknown';
};

const parseTickerKey = (value: string) =>
  normalizeText(value).replace(/\s*\*$/g, '').trim();

const findHeaderRowIndex = (rows: unknown[][]) => {
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row?.length) continue;
    const hasEmisora = row.some((c) => typeof c === 'string' && normalizeText(c).includes('EMISORA'));
    const hasValorMercado = row.some((c) => typeof c === 'string' && normalizeText(c).includes('VALOR MERCADO'));
    if (hasEmisora && hasValorMercado) return i;
  }
  return -1;
};

export const parseExcelHoldingsFile = async (file: File): Promise<ParseResult> => {
  const fileName = file.name ?? '';
  const appFromName = detectAppFromFilename(fileName);

  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' }) as unknown[][];
  if (!rows.length) {
    return { app: 'unknown', providerName: 'Importación', holdings: [] };
  }

  // Fallback: detect GBM from sheet cells.
  const app: ImportedAppKey =
    appFromName !== 'unknown'
      ? appFromName
      : rows.some((r) =>
          r.some((c) => typeof c === 'string' && normalizeText(c).includes('GBM'))
        )
        ? 'gbm'
        : 'unknown';

  const providerName = app === 'gbm' ? 'GBM' : 'Importación';

  const headerRowIndex = findHeaderRowIndex(rows);
  if (headerRowIndex === -1) {
    return { app, providerName, holdings: [] };
  }

  const headerRow = rows[headerRowIndex].map((c) => (typeof c === 'string' ? normalizeText(c) : ''));

  const idx = (tokens: string[]) => {
    const normalizedTokens = tokens.map(normalizeText);
    return headerRow.findIndex((h) => normalizedTokens.some((t) => h.includes(t)));
  };

  const keyIdx = idx(['EMISORA/FONDO', 'EMISORA', 'EMISOR', 'TITULO', 'TITULOS', 'FONDO', 'NOMBRE']);
  const balanceIdx = idx(['VALOR MERCADO', 'VALOR', 'IMPORTE', 'MONTO', 'TOTAL']);
  const rateIdx = idx(['RENDIMIENTO', 'TASA', 'YIELD', 'TASA_ANUAL', 'TASA ANUAL', 'ANUAL']);

  if (keyIdx === -1 || balanceIdx === -1) {
    return { app, providerName, holdings: [] };
  }

  const holdings: ExcelHolding[] = [];
  for (let r = headerRowIndex + 1; r < rows.length; r += 1) {
    const row = rows[r];
    if (!row?.length) continue;
    const rawKey = row[keyIdx];
    if (rawKey == null || String(rawKey).trim() === '') continue;

    const rawBalance = row[balanceIdx];
    const balance = parseExcelNumber(rawBalance);
    if (!Number.isFinite(balance) || balance <= 0) continue;

    const name = String(rawKey).trim().replace(/\s*\*$/g, '').trim();
    const key = parseTickerKey(String(rawKey));

    const rawRate = rateIdx !== -1 ? row[rateIdx] : undefined;
    const rateAnnualPct = rawRate ? parsePercent(rawRate) : undefined;

    holdings.push({
      app,
      key,
      name,
      balance,
      desc: name,
      rateAnnualPct,
    });
  }

  return { app, providerName, holdings };
};

export const buildImportedAccount = (args: {
  providerId: string;
  holding: ExcelHolding;
  accountId?: string;
  existingRateAnnualPct?: number;
  fallbackRateAnnualPct: number;
  existingChecklist?: Array<{ id: string; label: string; done: boolean }>;
  existingNotes?: string;
}) => {
  const {
    providerId,
    holding,
    accountId,
    existingRateAnnualPct,
    fallbackRateAnnualPct,
    existingChecklist,
    existingNotes,
  } = args;

  const rawRate =
    Number.isFinite(holding.rateAnnualPct as number)
      ? (holding.rateAnnualPct as number)
      : existingRateAnnualPct ?? fallbackRateAnnualPct;
  const rateAnnualPct = sanitizeNumber(rawRate, { min: 0, max: MAX_RATE_PCT });
  const balance = sanitizeNumber(holding.balance, { min: 0, max: MAX_BALANCE });
  const monthly = calculateMonthlyGain(balance, rateAnnualPct);
  const id = accountId ?? `import-${holding.key}-${providerId}-${Date.now()}`;

  return {
    id,
    name: holding.name,
    desc: holding.desc ?? '',
    balance,
    rate: rateAnnualPct,
    monthly,
    checklist: existingChecklist ?? [],
    notes: existingNotes ?? '',
  };
};

