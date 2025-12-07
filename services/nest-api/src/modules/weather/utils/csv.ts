export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows || rows.length === 0) return '';

  const keys = Array.from(
    rows.reduce(
      (acc, r) => {
        Object.keys(r).forEach((k) => acc.add(k));
        return acc;
      },
      new Set<string>(Object.keys(rows[0])),
    ),
  );

  const escape = (v: unknown) => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') {
      try {
        const j = JSON.stringify(v);
        return `"${j.replace(/"/g, '""')}"`;
      } catch {
        return '""';
      }
    }
    const s = String(v as string | number | boolean);
    if (/[,\n"]/g.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const header = keys.join(',');
  const body = rows
    .map((r) => keys.map((k) => escape(r[k])).join(','))
    .join('\n');

  return header + '\n' + body;
}
