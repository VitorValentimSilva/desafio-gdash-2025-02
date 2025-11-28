import { getTypeBadgeClass, formatPokedexNumber } from "@/lib/pokemon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PokemonUi } from "@/types/pokemon";

export default function PokemonCard({
  pokemon,
  onClick,
}: {
  pokemon: PokemonUi;
  onClick?: () => void;
}) {
  return (
    <Card
      className="p-4 hover-lift cursor-pointer flex flex-col items-center text-center transition-shadow"
      onClick={onClick}
    >
      <div className="w-28 h-28 mb-3 flex items-center justify-center">
        {pokemon.image ? (
          <img
            src={pokemon.image}
            alt={pokemon.name}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-4xl">❓</div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-sm text-muted-foreground">
          {formatPokedexNumber(pokemon.id)}
        </div>
        <h3 className="text-lg font-semibold capitalize">{pokemon.name}</h3>
      </div>

      <div className="flex gap-2 mt-3 flex-wrap justify-center">
        {(pokemon.types ?? []).map((t) => (
          <Badge
            key={t}
            className={`text-xs px-2 py-0.5 rounded-md font-medium ${getTypeBadgeClass(
              t
            )}`}
          >
            {t}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
