import { useCallback } from "react";
import type {
  ListParams,
  PagedResult,
  PokemonDetail,
  SearchParams,
  TypesParams,
} from "@/types/pokemon";
import * as api from "@/services/pokeApi";

export function usePoke() {
  const list = useCallback((params: ListParams = {}): Promise<PagedResult> => {
    return api.listPokemons(params);
  }, []);

  const search = useCallback((params: SearchParams): Promise<PagedResult> => {
    return api.searchPokemons(params);
  }, []);

  const filterByTypes = useCallback(
    (params: TypesParams): Promise<PagedResult> => {
      return api.filterByTypes(params);
    },
    []
  );

  const detail = useCallback(
    (idOrName: string, signal?: AbortSignal): Promise<PokemonDetail> => {
      return api.getPokemonDetail(idOrName, signal);
    },
    []
  );

  return {
    list,
    search,
    filterByTypes,
    detail,
  } as const;
}
