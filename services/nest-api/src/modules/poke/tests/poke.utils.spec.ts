import {
  extractIdFromUrl,
  normalizeOrder,
  parseTypesQuery,
  isRecord,
  safeNumber,
  safeString,
} from '../utils/poke.utils';

describe('poke.utils', () => {
  describe('extractIdFromUrl', () => {
    it('extracts numeric id', () => {
      expect(extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/123/')).toBe(
        123,
      );
      expect(extractIdFromUrl('/pokemon/7')).toBe(7);
    });
    it('returns null on mismatch', () => {
      expect(
        extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/bulbasaur/'),
      ).toBeNull();
      expect(extractIdFromUrl('')).toBeNull();
    });
  });

  describe('normalizeOrder', () => {
    it('returns valid orders or default', () => {
      expect(normalizeOrder('az')).toBe('az');
      expect(normalizeOrder(['za'])).toBe('za');
      expect(normalizeOrder('INVALID')).toBe('pokedex');
      expect(normalizeOrder(undefined)).toBe('pokedex');
    });
  });

  describe('parseTypesQuery', () => {
    it('parses comma separated string', () => {
      expect(parseTypesQuery('grass,Poison')).toEqual(['grass', 'poison']);
      expect(parseTypesQuery('  fire  , ')).toEqual(['fire']);
    });

    it('parses array inputs and flattens', () => {
      expect(parseTypesQuery(['grass,poison', 'water'])).toEqual([
        'grass',
        'poison',
        'water',
      ]);
    });

    it('returns empty array when input is falsy', () => {
      expect(parseTypesQuery(undefined)).toEqual([]);
      expect(parseTypesQuery('')).toEqual([]);
    });
  });

  describe('isRecord / safeNumber / safeString', () => {
    it('isRecord works', () => {
      expect(isRecord({ a: 1 })).toBe(true);
      expect(isRecord(null)).toBe(false);
      expect(isRecord('str')).toBe(false);
    });

    it('safeNumber returns numbers or undefined', () => {
      expect(safeNumber(3)).toBe(3);
      expect(safeNumber(NaN)).toBeUndefined();
      expect(safeNumber('3' as any)).toBeUndefined();
    });

    it('safeString returns string or fallback', () => {
      expect(safeString('hi')).toBe('hi');
      expect(safeString(123 as any, 'fallback')).toBe('fallback');
    });
  });
});
