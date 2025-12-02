import { useCallback, useEffect, useRef, useState } from "react";
import type { ListParams, PagedResult } from "@/types/pokemon";
import { usePoke } from "@/hooks/usePokedex";

export function usePokedexList(initialLimit = 12) {
  const { list, search, filterByTypes } = usePoke();

  const [pokemonList, setPokemonList] = useState<PagedResult["results"]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(initialLimit);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [query, setQuery] = useState<string>("");
  const [order, setOrder] = useState<"pokedex" | "az" | "za">("pokedex");
  const [types, setTypes] = useState<string[]>([]);

  const controllerRef = useRef<AbortController | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  const fetchPage = useCallback(
    async (pageNumber = 1) => {
      controllerRef.current?.abort();
      const ctrl = new AbortController();
      controllerRef.current = ctrl;

      const offset = (Math.max(1, pageNumber) - 1) * limit;
      setLoading(true);
      setError(null);

      try {
        let res;
        if (types && types.length > 0) {
          res = await filterByTypes({
            types,
            limit,
            offset,
            order,
            signal: ctrl.signal,
          });
        } else if (query && query.trim().length > 0) {
          res = await search({
            q: query,
            limit,
            offset,
            order,
            signal: ctrl.signal,
          });
        } else {
          res = await list({
            limit,
            offset,
            order,
            signal: ctrl.signal,
          } as ListParams);
        }

        setPokemonList(res.results ?? []);
        setTotalCount(res.count ?? 0);
        setPage(Math.max(1, pageNumber));
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Erro listagem:", err);
        setError(
          err instanceof Error ? err.message : "Erro ao carregar pokemons"
        );
      } finally {
        if (controllerRef.current === ctrl) setLoading(false);
      }
    },
    [limit, list, search, filterByTypes, order, query, types]
  );

  useEffect(() => {
    fetchPage(1);
    return () => controllerRef.current?.abort();
  }, [fetchPage]);

  return {
    pokemonList,
    loading,
    error,
    page,
    limit,
    totalCount,
    totalPages,
    setQuery,
    setOrder,
    setTypes,
    fetchPage,
  } as const;
}
