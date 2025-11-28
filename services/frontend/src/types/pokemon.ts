export interface PokemonSummaryApi {
  name: string;
  url: string;
}

export interface PokemonListResult {
  count: number;
  results: PokemonSummaryApi[];
}

export interface PokemonUi {
  id: number;
  name: string;
  image?: string | null;
  types: string[];
  baseStats?: Record<string, number>;
  description?: string | null;
}
