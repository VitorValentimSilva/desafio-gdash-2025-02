import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePokedex } from "@/hooks/usePokedex";
import type { PokemonUi } from "@/types/pokemon";
import { Button } from "@/components/ui/button";
import PokemonCard from "@/components/pokedex/PokemonCard";
import PokemonDetailModal from "@/components/pokedex/PokemonDetailModal";

export default function PokedexPage() {
  const { page, totalPages, items, loading, fetchPage, fetchDetail } =
    usePokedex(12);

  const [selected, setSelected] = useState<PokemonUi | null>(null);

  async function openDetail(p: { id: number; name: string }) {
    const det = await fetchDetail(p.id ?? p.name);
    setSelected(det);
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Explorar Pokémons</h1>
        <p className="text-muted-foreground">
          Buscando dados da PokeAPI via backend
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {loading ? (
          <div className="col-span-full text-center py-12">Carregando...</div>
        ) : (
          items.map((p) => (
            <PokemonCard
              key={p.id || p.name}
              pokemon={p}
              onClick={() => openDetail(p)}
            />
          ))
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchPage(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="px-3 py-2 rounded-md bg-surface/6">
          Página {page} de {totalPages}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <PokemonDetailModal
        open={!!selected}
        onClose={() => setSelected(null)}
        data={selected}
      />
    </>
  );
}
