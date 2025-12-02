import { useCallback, useRef, useState } from "react";
import type { PokemonDetail, PokemonListItem } from "@/types/pokemon";
import { usePoke } from "@/hooks/usePokedex";

export function usePokemonDetail() {
  const { detail } = usePoke();

  const [selected, setSelected] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detailControllerRef = useRef<AbortController | null>(null);

  const openDetail = useCallback(
    async (item: PokemonListItem) => {
      detailControllerRef.current?.abort();
      const ctrl = new AbortController();
      detailControllerRef.current = ctrl;

      setLoading(true);
      setError(null);

      try {
        const idOrName = item.name ?? String(item.id ?? "");
        const res = await detail(idOrName, ctrl.signal);
        setSelected(res);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Erro ao buscar detalhe:", err);
        setError(
          err instanceof Error ? err.message : "Erro ao carregar detalhes"
        );
      } finally {
        if (detailControllerRef.current === ctrl) setLoading(false);
      }
    },
    [detail]
  );

  const closeDetail = useCallback(() => {
    detailControllerRef.current?.abort();
    setSelected(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    selected,
    loading,
    error,
    openDetail,
    closeDetail,
  } as const;
}
