import PokemonCard from "@/components/pokedex/PokemonCard";
import type { PokemonListItem } from "@/types/pokemon";
import { useTranslation } from "react-i18next";

interface PokedexListProps {
  items: PokemonListItem[];
  loading: boolean;
  emptyMessage?: string;
  onItemClick?: (item: PokemonListItem) => void;
}

export default function PokedexList(props: PokedexListProps) {
  const { t } = useTranslation("poke");
  const {
    items,
    loading,
    emptyMessage = t("noPokemonFound"),
    onItemClick,
  } = props;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {loading ? (
        <div className="col-span-full text-center py-12">
          {t("loadingPokemon")}
        </div>
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
