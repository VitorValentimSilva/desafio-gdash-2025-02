import PokemonCard from "@/components/pokedex/PokemonCard";
import type { PokemonListItem } from "@/types/pokemon";

interface Props {
  items: PokemonListItem[];
  loading: boolean;
  emptyMessage?: string;
  onItemClick?: (item: PokemonListItem) => void;
}

export default function PokedexList({
  items,
  loading,
  emptyMessage = "Nenhum Pokémon encontrado.",
  onItemClick,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {loading ? (
        <div className="col-span-full text-center py-12">Carregando...</div>
      ) : items.length === 0 ? (
        <div className="col-span-full text-center py-12">{emptyMessage}</div>
      ) : (
        items.map((p) => (
          <PokemonCard
            key={p.id ?? p.name}
            pokemon={p}
            onClick={() => onItemClick?.(p)}
          />
        ))
      )}
    </div>
  );
}
