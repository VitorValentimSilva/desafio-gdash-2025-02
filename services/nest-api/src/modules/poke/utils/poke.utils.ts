export function extractIdFromUrl(url: string): number | null {
  const m = url.match(/\/pokemon\/(\d+)\/?$/);
  return m ? parseInt(m[1], 10) : null;
}

export function normalizeOrder(
  raw?: string | string[],
): 'pokedex' | 'az' | 'za' {
  const VALID_ORDERS = ['pokedex', 'az', 'za'] as const;
  const o = Array.isArray(raw) ? raw[0] : raw;
  if (!o) return 'pokedex';
  const lower = o.toLowerCase();
  if (VALID_ORDERS.includes(lower as (typeof VALID_ORDERS)[number])) {
    return lower as (typeof VALID_ORDERS)[number];
  }
  return 'pokedex';
}

export function parseTypesQuery(typesRaw?: string | string[]): string[] {
  if (!typesRaw) return [];
  if (typeof typesRaw === 'string') {
    return typesRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.toLowerCase());
  }
  return typesRaw
    .flatMap((s) => s.split(',').map((x) => x.trim()))
    .filter(Boolean)
    .map((s) => s.toLowerCase());
}

export function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

export const safeNumber = (v: unknown): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? v : undefined;

export const safeString = (v: unknown, fallback = ''): string =>
  typeof v === 'string' ? v : fallback;
