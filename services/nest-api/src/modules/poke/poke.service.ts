import {
  Injectable,
  Logger,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PokeApiRepository } from './repositories/poke.api.repository';
import type { PokemonListItem, PagedResult, Order } from './schemas/poke.types';
import {
  extractIdFromUrl,
  isRecord,
  safeNumber,
  safeString,
} from './utils/poke.utils';
import {
  PokemonAbilityEntryDto,
  PokemonStatEntryDto,
  PokemonTypeEntryDto,
} from './dto/poke.dto';
import { PokemonDetailResultDto } from './dto/poke.response.dto';
import { I18nService } from 'nestjs-i18n';

const CONCURRENCY_LIMIT = 3;

async function mapInBatches<T, R>(
  items: T[],
  batchSize: number,
  fn: (t: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const res = await Promise.all(batch.map(fn));
    out.push(...res);
  }
  return out;
}

@Injectable()
export class PokeService {
  private readonly logger = new Logger(PokeService.name);

  constructor(
    private readonly repo: PokeApiRepository,
    private readonly i18n: I18nService,
  ) {}

  private pageAndFormat(
    items: PokemonListItem[],
    limit: number,
    offset: number,
    order: Order,
  ): PagedResult {
    const mapped = items.map((it) => ({
      ...it,
      id: it.id ?? extractIdFromUrl(it.url) ?? undefined,
    }));

    if (order === 'pokedex') {
      mapped.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    } else if (order === 'az') {
      mapped.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      mapped.sort((a, b) => b.name.localeCompare(a.name));
    }

    const count = mapped.length;
    const page = mapped.slice(offset, offset + limit);

    const next =
      offset + limit < count
        ? `?limit=${limit}&offset=${offset + limit}&order=${order}`
        : null;
    const previous =
      offset - limit >= 0
        ? `?limit=${limit}&offset=${Math.max(0, offset - limit)}&order=${order}`
        : null;

    return { count, limit, offset, results: page, next, previous };
  }

  async list(
    limit = 20,
    offset = 0,
    order: Order = 'pokedex',
  ): Promise<PagedResult> {
    if (order === 'pokedex') {
      const r = await this.repo.list(limit, offset);
      const results: PokemonListItem[] = (r.results ?? []).map((it) => ({
        name: it.name,
        url: it.url,
        id: extractIdFromUrl(it.url) ?? undefined,
      }));
      return {
        count: r.count ?? results.length,
        limit,
        offset,
        results,
        next: r.next ?? null,
        previous: r.previous ?? null,
      };
    }

    const count = await this.repo.getMetaCount();
    const batchSize = 500;
    const pages = Math.ceil(Math.max(1, count) / batchSize);
    const fetchedItems: PokemonListItem[] = [];

    for (let i = 0; i < pages; i++) {
      const bOffset = i * batchSize;
      try {
        const resp = await this.repo.list(batchSize, bOffset);
        const list = (resp.results ?? []).map((r) => ({
          name: r.name,
          url: r.url,
          id: extractIdFromUrl(r.url) ?? undefined,
        }));
        fetchedItems.push(...list);
      } catch (err: unknown) {
        this.logger.warn(
          this.i18n.t('poke.FailedToFetch', {
            args: { i, bOffset, error: String(err) },
          }),
        );
      }
    }

    return this.pageAndFormat(fetchedItems, limit, offset, order);
  }

  async detail(nameOrId: string): Promise<PokemonDetailResultDto> {
    if (!nameOrId)
      throw new BadRequestException(this.i18n.t('poke.IdOrNameRequired'));

    try {
      this.logger.debug(
        this.i18n.t('poke.FetchingDetail', { args: { nameOrId } }),
      );
      const raw = await this.repo.getPokemonDetail(nameOrId);

      if (!isRecord(raw)) {
        this.logger.warn(
          this.i18n.t('poke.UnexpectedPokemonDetail', { args: { nameOrId } }),
        );
        throw new HttpException(
          this.i18n.t('poke.InvalidResponse'),
          HttpStatus.BAD_GATEWAY,
        );
      }

      const rawObj = raw as Partial<PokemonDetailResultDto>;

      const id = safeNumber(rawObj.id);
      const name = safeString(rawObj.name, String(nameOrId));
      const height = safeNumber(rawObj.height);
      const weight = safeNumber(rawObj.weight);

      const spritesRaw = rawObj.sprites;
      const sprites =
        isRecord(spritesRaw) && spritesRaw !== null
          ? {
              front_default:
                typeof (spritesRaw as { front_default?: unknown })
                  .front_default === 'string'
                  ? (spritesRaw as { front_default: string }).front_default
                  : null,
              front_shiny:
                typeof (spritesRaw as { front_shiny?: unknown }).front_shiny ===
                'string'
                  ? (spritesRaw as { front_shiny: string }).front_shiny
                  : null,
            }
          : undefined;

      const typesRaw = Array.isArray(rawObj.types)
        ? (rawObj.types as unknown[])
        : [];
      const types: PokemonTypeEntryDto[] = typesRaw.map((t) => {
        if (isRecord(t)) {
          const slot = safeNumber(t.slot) ?? 0;
          const typeObj = t.type;
          const nameVal = isRecord(typeObj)
            ? safeString(typeObj.name).toLowerCase()
            : '';
          const urlVal =
            isRecord(typeObj) && typeof typeObj.url === 'string'
              ? typeObj.url
              : undefined;
          return { slot, name: nameVal, url: urlVal } as PokemonTypeEntryDto;
        }
        return { slot: 0, name: '', url: undefined } as PokemonTypeEntryDto;
      });

      const statsRaw = Array.isArray(rawObj.stats)
        ? (rawObj.stats as unknown[])
        : [];
      const stats: PokemonStatEntryDto[] = statsRaw.map((s) => {
        if (isRecord(s)) {
          const base =
            'base_stat' in s
              ? (safeNumber((s as { base_stat?: unknown }).base_stat) ?? 0)
              : 0;
          const statName =
            'stat' in s && isRecord((s as { stat?: unknown }).stat)
              ? safeString((s as { stat: { name?: unknown } }).stat.name)
              : '';
          return { base_stat: base, name: statName } as PokemonStatEntryDto;
        }
        return { base_stat: 0, name: '' } as PokemonStatEntryDto;
      });

      const abilitiesRaw = Array.isArray(rawObj.abilities)
        ? (rawObj.abilities as unknown[])
        : [];
      const abilities: PokemonAbilityEntryDto[] | undefined =
        abilitiesRaw.length > 0
          ? abilitiesRaw.map((a) => {
              if (isRecord(a)) {
                const abilityObj = a.ability;
                const abilityName = isRecord(abilityObj)
                  ? safeString(abilityObj.name)
                  : '';
                const isHidden =
                  typeof a === 'object' && a !== null && 'is_hidden' in a
                    ? Boolean((a as { is_hidden?: unknown }).is_hidden)
                    : false;
                return {
                  name: abilityName,
                  is_hidden: isHidden,
                } as PokemonAbilityEntryDto;
              }
              return { name: '', is_hidden: false } as PokemonAbilityEntryDto;
            })
          : undefined;

      const dto: PokemonDetailResultDto = {
        id,
        name,
        height,
        weight,
        sprites,
        types,
        stats,
        abilities,
      };

      return dto;
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error(
          this.i18n.t('poke.DetailFetchFailed', {
            args: { nameOrId, error: err.message },
          }),
          err.stack,
        );
      } else {
        this.logger.error(
          this.i18n.t('poke.DetailFetchFailed', {
            args: { nameOrId, error: String(err) },
          }),
        );
      }

      if (err instanceof HttpException) throw err;

      throw new HttpException(
        { message: this.i18n.t('poke.FailedToFetchPokemon') },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async searchByName(
    q: string,
    limit = 20,
    offset = 0,
    order: Order = 'pokedex',
  ): Promise<PagedResult> {
    const query = (q ?? '').trim().toLowerCase();
    if (!query) return this.list(limit, offset, order);

    const count = await this.repo.getMetaCount();
    const batchSize = 500;
    const pages = Math.ceil(Math.max(1, count) / batchSize);
    const fetchedItems: PokemonListItem[] = [];

    for (let i = 0; i < pages; i++) {
      const bOffset = i * batchSize;
      try {
        const resp = await this.repo.list(batchSize, bOffset);
        const list = (resp.results ?? []).map((r) => ({
          name: r.name,
          url: r.url,
          id: extractIdFromUrl(r.url) ?? undefined,
        }));
        fetchedItems.push(...list);
      } catch (err: unknown) {
        this.logger.warn(
          this.i18n.t('poke.FailedToFetchSearching', {
            args: { i, bOffset, error: String(err) },
          }),
        );
      }
    }

    const filtered = fetchedItems.filter((p) =>
      p.name.toLowerCase().includes(query),
    );
    return this.pageAndFormat(filtered, limit, offset, order);
  }

  async filterByTypes(
    types: string[] = [],
    limit = 20,
    offset = 0,
    order: Order = 'pokedex',
  ): Promise<PagedResult> {
    if (!types || types.length === 0) return this.list(limit, offset, order);

    const fetchForType = async (typeName: string) => {
      try {
        const r = await this.repo.type(typeName);
        const list = (r.pokemon ?? []).map((p) => {
          const url = p.pokemon.url;
          return {
            name: p.pokemon.name,
            url,
            id: extractIdFromUrl(url) ?? undefined,
          } as PokemonListItem;
        });
        return list;
      } catch (err: unknown) {
        this.logger.warn(
          this.i18n.t('poke.FailedToFetchType', {
            args: { typeName, error: String(err) },
          }),
        );
        return [] as PokemonListItem[];
      }
    };

    const listsByType = await mapInBatches(
      types,
      CONCURRENCY_LIMIT,
      fetchForType,
    );

    const map = new Map<string, PokemonListItem>();
    for (const arr of listsByType) {
      for (const p of arr) {
        if (!map.has(p.name)) map.set(p.name, p);
      }
    }

    const union = Array.from(map.values());
    return this.pageAndFormat(union, limit, offset, order);
  }
}
