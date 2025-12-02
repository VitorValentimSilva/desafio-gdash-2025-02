export type Order = 'pokedex' | 'az' | 'za';

export type PokemonListItem = {
  name: string;
  url: string;
  id?: number;
  types?: string[];
  image?: string;
};

export type PagedResult = {
  count: number;
  limit: number;
  offset: number;
  results: PokemonListItem[];
  next?: string | null;
  previous?: string | null;
};

export interface PokeApiListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: { name: string; url: string }[];
}

export interface PokeApiTypeResponse {
  pokemon: { pokemon: { name: string; url: string }; slot: number }[];
}
