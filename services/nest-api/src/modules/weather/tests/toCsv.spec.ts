import { toCsv } from '../utils/csv';

describe('toCsv', () => {
  it('returns empty string for empty input', () => {
    expect(toCsv([])).toBe('');
  });

  it('exports primitives and escapes commas/quotes/newlines', () => {
    const rows = [
      { a: 'x,y', b: 'quoted "here"', c: 1 },
      { a: 'z\nline', b: null, c: true },
    ];
    const csv = toCsv(rows);
    expect(csv).toContain('a,b,c');
    expect(csv).toContain('"x,y"');
    expect(csv).toContain('"quoted ""here"""');
    expect(typeof csv).toBe('string');
  });

  it('serializes objects as JSON in quotes', () => {
    const rows = [{ meta: { x: 1 } }];
    const csv = toCsv(rows);

    expect(csv).toContain('"{""x"":1}"');

    expect(csv.startsWith('meta\n')).toBe(true);
  });
});
