import { rowsToXlsxBuffer } from '../utils/excel';

describe('rowsToXlsxBuffer', () => {
  it('returns a Buffer even for empty rows', async () => {
    const buf = await rowsToXlsxBuffer([]);
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(0);
  });

  it('writes rows to xlsx and returns Buffer', async () => {
    const rows = [
      { a: 1, b: 'x' },
      { a: 2, b: 'y' },
    ];
    const buf = await rowsToXlsxBuffer(rows);
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(0);
  });
});
