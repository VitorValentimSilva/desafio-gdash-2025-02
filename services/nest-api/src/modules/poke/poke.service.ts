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
  PokemonSpriteDto,
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

  private async enrichWithTypes(
    items: PokemonListItem[],
  ): Promise<PokemonListItem[]> {
    const fetchTypesFor = async (
      p: PokemonListItem,
    ): Promise<PokemonListItem> => {
      try {
        const raw = await this.repo.getPokemonDetail(p.name);
        if (!isRecord(raw)) return { ...p, types: [], image: undefined };

        const typesRaw = Array.isArray(raw['types'])
          ? (raw['types'] as unknown[])
          : [];
        const types: string[] = typesRaw
          .map((t) => {
            if (isRecord(t) && isRecord(t['type'])) {
              const typeObj = t['type'];
              return safeString(typeObj['name']).toLowerCase();
            }
            return '';
          })
          .filter(Boolean);

        let image: string | undefined = undefined;
        const spritesField = raw['sprites'];
        if (isRecord(spritesField)) {
          const other = spritesField['other'];
          if (isRecord(other)) {
            const official = other['official-artwork'];
            if (
              isRecord(official) &&
              typeof official['front_default'] === 'string'
            ) {
              image = String(official['front_default']);
            }
          }
          if (!image && typeof spritesField['front_default'] === 'string') {
            image = String(spritesField['front_default']);
          }
          if (!image && typeof spritesField['front_shiny'] === 'string') {
            image = String(spritesField['front_shiny']);
          }
        }

        return { ...p, types, image };
      } catch (err: unknown) {
        this.logger.debug(
          `Failed to fetch types/image for ${p.name}: ${String(err)}`,
        );
        return { ...p, types: [], image: undefined };
      }
    };

    const enriched = await mapInBatches(
      items,
      CONCURRENCY_LIMIT,
      fetchTypesFor,
    );
    return enriched;
  }

  private async pageAndFormat(
    items: PokemonListItem[],
    limit: number,
    offset: number,
    order: Order,
  ): Promise<PagedResult> {
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
    const enrichedPage = await this.enrichWithTypes(page);

    const next =
      offset + limit < count
        ? `?limit=${limit}&offset=${offset + limit}&order=${order}`
        : null;
    const previous =
      offset - limit >= 0
        ? `?limit=${limit}&offset=${Math.max(0, offset - limit)}&order=${order}`
        : null;

    return { count, limit, offset, results: enrichedPage, next, previous };
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

      const enriched = await this.enrichWithTypes(results);

      return {
        count: r.count ?? results.length,
        limit,
        offset,
        results: enriched,
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

      const rawObj = raw;

      const id = safeNumber((rawObj as { id?: unknown }).id);
      const name = safeString(
        (rawObj as { name?: unknown }).name,
        String(nameOrId),
      );
      const height = safeNumber((rawObj as { height?: unknown }).height);
      const weight = safeNumber((rawObj as { weight?: unknown }).weight);

      const spritesField = (rawObj as { sprites?: unknown }).sprites;
      let sprites: PokemonSpriteDto | undefined = undefined;
      if (isRecord(spritesField) && spritesField !== null) {
        const front_default =
          typeof spritesField['front_default'] === 'string'
            ? String(spritesField['front_default'])
            : null;
        const front_shiny =
          typeof spritesField['front_shiny'] === 'string'
            ? String(spritesField['front_shiny'])
            : null;
        sprites = { front_default, front_shiny };
      }

      let image: string | undefined = undefined;
      const otherField = isRecord(spritesField)
        ? spritesField['other']
        : undefined;
      if (isRecord(otherField)) {
        const officialArt = otherField['official-artwork'];
        if (
          isRecord(officialArt) &&
          typeof officialArt['front_default'] === 'string'
        ) {
          image = String(officialArt['front_default']);
        }
      }
      if (!image && sprites?.front_default)
        image = sprites.front_default ?? undefined;
      if (!image && sprites?.front_shiny)
        image = sprites.front_shiny ?? undefined;

      const typesRaw = Array.isArray((rawObj as { types?: unknown }).types)
        ? ((rawObj as { types?: unknown }).types as unknown[])
        : [];
      const types: PokemonTypeEntryDto[] = typesRaw.map(
        (t): PokemonTypeEntryDto => {
          if (isRecord(t)) {
            const slot = safeNumber(t['slot']) ?? 0;
            const typeObj = t['type'];
            if (isRecord(typeObj)) {
              const nameVal = safeString(typeObj['name']).toLowerCase();
              const urlVal =
                typeof typeObj['url'] === 'string'
                  ? String(typeObj['url'])
                  : undefined;
              return {
                slot,
                name: nameVal,
                url: urlVal,
              } as PokemonTypeEntryDto;
            }
          }
          return { slot: 0, name: '', url: undefined } as PokemonTypeEntryDto;
        },
      );

      const statsRaw = Array.isArray((rawObj as { stats?: unknown }).stats)
        ? ((rawObj as { stats?: unknown }).stats as unknown[])
        : [];
      const stats: PokemonStatEntryDto[] = statsRaw.map(
        (s): PokemonStatEntryDto => {
          if (isRecord(s)) {
            const base =
              'base_stat' in s ? (safeNumber(s['base_stat']) ?? 0) : 0;
            const statField = s['stat'];
            const statName = isRecord(statField)
              ? safeString(statField['name'])
              : '';
            return { base_stat: base, name: statName } as PokemonStatEntryDto;
          }
          return { base_stat: 0, name: '' } as PokemonStatEntryDto;
        },
      );

      const baseStats: Record<string, number> = {};
      for (const s of stats) {
        if (s && typeof s.name === 'string') {
          baseStats[s.name] = Number(s.base_stat ?? 0);
        }
      }

      const abilitiesRaw = Array.isArray(
        (rawObj as { abilities?: unknown }).abilities,
      )
        ? ((rawObj as { abilities?: unknown }).abilities as unknown[])
        : [];
      const abilities: PokemonAbilityEntryDto[] | undefined =
        abilitiesRaw.length > 0
          ? abilitiesRaw.map((a): PokemonAbilityEntryDto => {
              if (isRecord(a)) {
                const abilityObj = a['ability'];
                const abilityName = isRecord(abilityObj)
                  ? safeString(abilityObj['name'])
                  : '';
                const isHidden =
                  typeof a['is_hidden'] === 'boolean'
                    ? Boolean(a['is_hidden'])
                    : false;
                return {
                  name: abilityName,
                  is_hidden: isHidden,
                } as PokemonAbilityEntryDto;
              }
              return { name: '', is_hidden: false } as PokemonAbilityEntryDto;
            })
          : undefined;

      let description: string | undefined = undefined;
      try {
        const speciesRef = (rawObj as { species?: unknown }).species;
        if (isRecord(speciesRef) && typeof speciesRef['url'] === 'string') {
          const speciesUrl = String(speciesRef['url']);

          type RepoWithSpecies = {
            getPokemonSpecies?: (urlOrName: string) => Promise<unknown>;
          };
          const repoWithSpecies = this.repo as unknown as RepoWithSpecies;
          if (typeof repoWithSpecies.getPokemonSpecies === 'function') {
            const speciesRaw =
              await repoWithSpecies.getPokemonSpecies(speciesUrl);
            if (
              isRecord(speciesRaw) &&
              Array.isArray(speciesRaw['flavor_text_entries'])
            ) {
              const entries = speciesRaw['flavor_text_entries'] as unknown[];
              const enEntry = entries.find(
                (e) =>
                  isRecord(e) &&
                  isRecord(e['language']) &&
                  (e['language'] as { name?: unknown })['name'] === 'en',
              );
              const rawText = isRecord(enEntry)
                ? enEntry['flavor_text']
                : undefined;
              if (typeof rawText === 'string') {
                description = String(rawText)
                  .replace(/\s+/g, ' ')
                  .replace(/\f/g, ' ')
                  .trim();
              }
            }
          } else {
            if (
              isRecord(speciesRef) &&
              Array.isArray(speciesRef['flavor_text_entries'])
            ) {
              const entries = speciesRef['flavor_text_entries'] as unknown[];
              const en = entries.find(
                (e) =>
                  isRecord(e) &&
                  isRecord(e['language']) &&
                  e['language']['name'] === 'en',
              );
              const rawText = isRecord(en) ? en['flavor_text'] : undefined;
              if (typeof rawText === 'string') {
                description = String(rawText)
                  .replace(/\s+/g, ' ')
                  .replace(/\f/g, ' ')
                  .trim();
              }
            }
          }
        }
      } catch (err) {
        this.logger.debug(
          `Failed to fetch species/description for ${nameOrId}: ${String(err)}`,
        );
      }

      let weaknesses: string[] = [];
      try {
        const typeNames = types.map((t) => t.name).filter(Boolean);
        if (typeNames.length > 0) {
          const fetchType = async (typeName: string): Promise<string[]> => {
            try {
              const typeResp = await this.repo.type(typeName);
              if (isRecord(typeResp)) {
                const rel = (typeResp as Record<string, unknown>)[
                  'damage_relations'
                ];
                if (isRecord(rel) && Array.isArray(rel['double_damage_from'])) {
                  const dd = rel['double_damage_from'] as unknown[];
                  return dd
                    .map((d) =>
                      isRecord(d) ? safeString(d['name']).toLowerCase() : '',
                    )
                    .filter(Boolean);
                }
              }
            } catch (err) {
              this.logger.debug(
                `Failed to fetch type ${typeName}: ${String(err)}`,
              );
            }
            return [];
          };

          const lists = await mapInBatches(
            typeNames,
            CONCURRENCY_LIMIT,
            fetchType,
          );
          const set = new Set<string>();
          for (const arr of lists) {
            for (const nm of arr) {
              if (nm) set.add(nm);
            }
          }
          weaknesses = Array.from(set);
        }
      } catch (err) {
        this.logger.debug(
          `Failed to compute weaknesses for ${nameOrId}: ${String(err)}`,
        );
        weaknesses = [];
      }

      const dto: PokemonDetailResultDto = {
        id,
        name,
        height,
        weight,
        sprites,
        image,
        description,
        weaknesses,
        baseStats,
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
