export type Order = "pokedex" | "az" | "za";

export interface PokemonListItem {
  name: string;
  url: string;
  id?: number;
  types?: string[];
  image?: string;
}

export interface PagedResult {
  count: number;
  limit: number;
  offset: number;
  results: PokemonListItem[];
  next?: string | null;
  previous?: string | null;
}

export interface PokemonSprite {
  front_default?: string | null;
  front_shiny?: string | null;
}

export interface PokemonTypeEntry {
  slot: number;
  name: string;
  url?: string;
}

export interface PokemonStatEntry {
  base_stat: number;
  name: string;
}

export interface PokemonAbilityEntry {
  name: string;
  is_hidden: boolean;
}

export interface PokemonDetail {
  id?: number;
  name: string;
  height?: number;
  weight?: number;
  sprites?: PokemonSprite;
  types: PokemonTypeEntry[];
  stats: PokemonStatEntry[];
  abilities?: PokemonAbilityEntry[];
  image?: string;
  description?: string;
  weaknesses?: string[];
  baseStats?: Record<string, number>;
}

export interface ListParams {
  limit?: number;
  offset?: number;
  order?: Order;
  signal?: AbortSignal;
}

export interface SearchParams extends ListParams {
  q: string;
}

export interface TypesParams extends ListParams {
  types: string[];
}

export interface FiltersState {
  q: string;
  order: Order;
  types: string[];
}
