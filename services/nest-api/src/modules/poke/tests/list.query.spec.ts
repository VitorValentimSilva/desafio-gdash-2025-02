import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  ListQueryDto,
  SearchQueryDto,
  TypesQueryDto,
} from '../dto/poke.query.dto';

describe('List/Search/Types Query DTOs', () => {
  it('ListQueryDto: valid defaults', async () => {
    const dto = plainToInstance(ListQueryDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.offset).toBe(0);
    expect(dto.limit).toBe(20);
    expect(dto.order).toBe('pokedex');
  });

  it('ListQueryDto: invalid offset/limit', async () => {
    const dto = plainToInstance(ListQueryDto, {
      offset: -1,
      limit: 0,
      order: 'invalid',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(1);
    const props = errors.map((e) => e.property);
    expect(props).toEqual(expect.arrayContaining(['offset', 'limit', 'order']));
  });

  it('SearchQueryDto: valid q', async () => {
    const dto = plainToInstance(SearchQueryDto, { q: 'pika' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.q).toBe('pika');
  });

  it('TypesQueryDto: accepts string', async () => {
    const dto = plainToInstance(TypesQueryDto, { types: 'grass, poison' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.types).toBe('grass, poison');
  });
});
