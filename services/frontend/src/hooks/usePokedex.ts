import { useCallback, useEffect, useMemo, useState } from "react";
import { pokeList, pokeDetail } from "@/services/pokeApi";
import type { PokemonUi } from "@/types/pokemon";

const ITEMS_PER_PAGE = 12;

function mapApiToUi(
  summary: { name: string; url: string },
  idFromUrl?: number,
  sprite?: string,
  types: string[] = []
): PokemonUi {
  const id = idFromUrl ?? NaN;
  return {
    id,
    name: summary.name,
    image: sprite ?? null,
    types,
  };
}

export function usePokedex(itemsPerPage = ITEMS_PER_PAGE) {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<PokemonUi[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchPage = useCallback(
    async (pageNumber = 1) => {
      setLoading(true);
      try {
        const offset = (pageNumber - 1) * itemsPerPage;
        const res = await pokeList(itemsPerPage, offset);
        setTotal(res.count);

        const details = await Promise.all(
          res.results.map(async (r) => {
            try {
              const det = await pokeDetail(r.name);
              const id = det.id as number;
              const sprite =
                det.sprites?.other?.["official-artwork"]?.front_default ??
                det.sprites?.front_default ??
                null;
              const types = (det.types ?? []).map(
                (t: { type: { name: string } }) =>
                  t.type?.name?.[0]?.toUpperCase() + t.type?.name?.slice(1)
              );
              return mapApiToUi(r, id, sprite, types);
            } catch {
              const match = r.url.match(/\/pokemon\/(\d+)\/?$/);
              const id = match ? Number(match[1]) : undefined;
              return mapApiToUi(r, id);
            }
          })
        );

        setItems(details);
        setPage(pageNumber);
      } catch (err) {
        console.error("Erro ao buscar pokemons:", err);
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage]
  );

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / itemsPerPage)),
    [total, itemsPerPage]
  );

  const fetchDetail = useCallback(async (nameOrId: string | number) => {
    setDetailLoading(true);
    try {
      const det = await pokeDetail(nameOrId);

      const types = (det.types ?? []).map(
        (t: { type: { name: string } }) =>
          t.type?.name?.[0]?.toUpperCase() + t.type?.name?.slice(1)
      );
      const sprite =
        det.sprites?.other?.["official-artwork"]?.front_default ??
        det.sprites?.front_default ??
        null;
      const stats: Record<string, number> = {};
      for (const s of det.stats ?? []) {
        stats[s.stat?.name ?? ""] = s.base_stat;
      }
      return {
        id: det.id,
        name: det.name,
        image: sprite,
        types,
        baseStats: stats,
        height: det.height,
        weight: det.weight,
      } as PokemonUi & {
        baseStats: Record<string, number>;
        height: number;
        weight: number;
      };
    } catch (err) {
      console.error("Erro ao buscar detalhe:", err);
      return null;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  return {
    page,
    setPage,
    total,
    totalPages,
    items,
    loading,
    fetchPage,
    fetchDetail,
    detailLoading,
  };
}
