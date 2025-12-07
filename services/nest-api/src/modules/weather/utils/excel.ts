import ExcelJS, { Workbook } from 'exceljs';

export async function rowsToXlsxBuffer(
  rows: Record<string, unknown>[],
): Promise<Buffer> {
  const wb: Workbook = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('weather');

  if (!rows || rows.length === 0) {
    ws.addRow(['no data']);
  } else {
    const keys = Object.keys(rows[0]);
    ws.addRow(keys);
    for (const r of rows) {
      const row = keys.map((k) => {
        const val = r[k];
        if (typeof val === 'object') return JSON.stringify(val);
        return val;
      });
      ws.addRow(row);
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
