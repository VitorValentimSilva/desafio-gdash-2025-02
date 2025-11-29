import { Test, TestingModule } from '@nestjs/testing';
import { PokeService } from '../poke.service';
import { PokeApiRepository } from '../repositories/poke.api.repository';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

const makeI18nMock = () => ({
  t: jest.fn(
    (
      key: string,
      opts?: { lang?: string; args?: unknown[] | Record<string, unknown> },
    ) => {
      if (opts?.args) {
        if (Array.isArray(opts.args)) return String(opts.args.join(' '));
        if (typeof opts.args === 'object' && opts.args !== null) {
          return Object.values(opts.args)
            .map((v) => String(v))
            .join(' ');
        }
      }
      return String(key);
    },
  ),
});

describe('PokeService', () => {
  let service: PokeService;
  let repoMock: {
    list: jest.Mock;
    getMetaCount: jest.Mock;
    listAll?: jest.Mock;
    getPokemonDetail: jest.Mock;
    type: jest.Mock;
  };
  let i18nMock: ReturnType<typeof makeI18nMock>;

  beforeEach(async () => {
    repoMock = {
      list: jest.fn(),
      getMetaCount: jest.fn(),
      getPokemonDetail: jest.fn(),
      type: jest.fn(),
    };

    i18nMock = makeI18nMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokeService,
        {
          provide: PokeApiRepository,
          useValue: repoMock as unknown as PokeApiRepository,
        },
        { provide: I18nService, useValue: i18nMock },
      ],
    }).compile();

    service = module.get<PokeService>(PokeService);

    jest.spyOn(service['logger'], 'error').mockImplementation(() => {});
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => {});
    jest.spyOn(service['logger'], 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('list - should return paged result when order=pokedex delegating to repo', async () => {
    repoMock.list.mockResolvedValue({
      count: 2,
      next: null,
      previous: null,
      results: [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
      ],
    });

    const res = await service.list(20, 0, 'pokedex');
    expect(res.count).toBe(2);
    expect(res.results[0].id).toBe(1);
    expect(repoMock.list).toHaveBeenCalledWith(20, 0);
  });

  it('searchByName - should filter correctly by name (case-insensitive)', async () => {
    repoMock.getMetaCount.mockResolvedValue(2);
    repoMock.list.mockResolvedValueOnce({
      count: 2,
      next: null,
      previous: null,
      results: [
        { name: 'Pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
        { name: 'Raichu', url: 'https://pokeapi.co/api/v2/pokemon/26/' },
      ],
    });

    const res = await service.searchByName('pika', 20, 0, 'pokedex');
    expect(res.results.length).toBe(1);
    expect(res.results[0].name.toLowerCase()).toContain('pika');
    expect(repoMock.getMetaCount).toHaveBeenCalled();
    expect(repoMock.list).toHaveBeenCalled();
  });

  it('filterByTypes - should union results from multiple types without duplicates', async () => {
    repoMock.type.mockImplementation((typeName: string) => {
      if (typeName === 'grass') {
        return {
          pokemon: [
            {
              pokemon: {
                name: 'bulbasaur',
                url: 'https://pokeapi.co/api/v2/pokemon/1/',
              },
              slot: 1,
            },
          ],
        };
      }
      if (typeName === 'poison') {
        return {
          pokemon: [
            {
              pokemon: {
                name: 'bulbasaur',
                url: 'https://pokeapi.co/api/v2/pokemon/1/',
              },
              slot: 1,
            },
            {
              pokemon: {
                name: 'oddish',
                url: 'https://pokeapi.co/api/v2/pokemon/43/',
              },
              slot: 1,
            },
          ],
        };
      }
      return { pokemon: [] };
    });

    const res = await service.filterByTypes(
      ['grass', 'poison'],
      20,
      0,
      'pokedex',
    );
    const names = res.results.map((r) => r.name).sort();
    expect(names).toEqual(['bulbasaur', 'oddish'].sort());
    expect(repoMock.type).toHaveBeenCalledTimes(2);
  });

  it('detail - should map raw response to PokemonDetailResultDto and validate fields', async () => {
    const raw = {
      id: 25,
      name: 'Pikachu',
      height: 4,
      weight: 60,
      sprites: { front_default: 'url1', front_shiny: 'url2' },
      types: [{ slot: 1, type: { name: 'electric', url: 'u' } }],
      stats: [{ base_stat: 35, stat: { name: 'hp' } }],
      abilities: [{ is_hidden: false, ability: { name: 'static' } }],
    };

    repoMock.getPokemonDetail.mockResolvedValue(raw);

    const res = await service.detail('25');

    expect(res).toBeDefined();
    expect(res.id).toBe(25);
    expect(res.name).toBe('Pikachu');
    expect(res.sprites).toMatchObject({
      front_default: 'url1',
      front_shiny: 'url2',
    });
    expect(res.types[0].name).toBe('electric');
    expect(res.stats[0].base_stat).toBe(35);
    expect(res.abilities?.[0].name).toBe('static');

    expect(repoMock.getPokemonDetail).toHaveBeenCalledWith('25');
  });

  it('detail - should throw BadRequestException on empty id', async () => {
    await expect(service.detail('')).rejects.toThrow(BadRequestException);
  });

  it('detail - should convert repo errors to HttpException(502)', async () => {
    repoMock.getPokemonDetail.mockRejectedValue(new Error('upstream failure'));
    try {
      await service.detail('25');

      fail('Expected service.detail to throw');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(HttpException);

      if (err instanceof HttpException) {
        expect(err.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
      }
    }
  });

  it('list - fallback when batches throw: should continue and return partial results', async () => {
    repoMock.getMetaCount.mockResolvedValue(3);
    repoMock.list
      .mockResolvedValueOnce({
        count: 3,
        next: null,
        previous: null,
        results: [{ name: 'a', url: 'https://pokeapi.co/api/v2/pokemon/1/' }],
      })
      .mockRejectedValueOnce(new Error('boom'));

    const res = await service.list(20, 0, 'az');
    expect(repoMock.getMetaCount).toHaveBeenCalled();
    expect(repoMock.list).toHaveBeenCalled();
    expect(res.count).toBeGreaterThanOrEqual(0);
    expect(res.results.length).toBeGreaterThanOrEqual(1);
  });
});
