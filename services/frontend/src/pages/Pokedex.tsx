import PokedexFilters from "@/components/pokedex/PokedexFilters";
import PokedexList from "@/components/pokedex/PokedexList";
import PokedexPagination from "@/components/pokedex/PokedexPagination";
import PokemonDetailModal from "@/components/pokedex/PokemonDetailModal";
import { usePokedexList } from "@/hooks/usePokedexList";
import { usePokemonDetail } from "@/hooks/usePokemonDetail";

export default function PokedexPage() {
  const {
    pokemonList,
    loading,
    error,
    page,
    totalPages,
    setQuery,
    setOrder,
    setTypes,
    fetchPage,
  } = usePokedexList(12);

  const {
    selected,
    loading: detailLoading,
    error: detailError,
    openDetail,
    closeDetail,
  } = usePokemonDetail();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Pokédex</h1>
        <p className="text-muted-foreground">
          Explore a vasta coleção de Pokémons e descubra suas características
          únicas.
        </p>
      </div>

      {error && <div className="mb-4 text-red-500">{error}</div>}

      <PokedexFilters
        value={{ q: "", order: "pokedex", types: [] }}
        onChange={(s) => {
          setQuery(s.q);
          setOrder(s.order);
          setTypes(s.types);
        }}
      />

      <PokedexList
        items={pokemonList}
        loading={loading}
        onItemClick={openDetail}
      />

      <PokedexPagination
        page={page}
        totalPages={totalPages}
        onChange={(p) => fetchPage(p)}
      />

      <PokemonDetailModal
        open={!!selected}
        onClose={closeDetail}
        data={selected}
      />

      {detailLoading && (
        <div className="fixed bottom-6 right-6 bg-background/90 p-3 rounded shadow">
          Carregando detalhes...
        </div>
      )}

      {detailError && (
        <div className="fixed bottom-6 left-6 bg-red-50 text-red-900 p-3 rounded shadow">
          {detailError}
        </div>
      )}
    </>
  );
}
