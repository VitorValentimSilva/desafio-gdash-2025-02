import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const samplePokemon = [
  {
    id: 1,
    name: "Bulbasaur",
    types: ["Grass", "Poison"],
    image: "🌱",
    desc: "Seed Pokémon — friendly and calm.",
  },
  {
    id: 4,
    name: "Charmander",
    types: ["Fire"],
    image: "🔥",
    desc: "Lizard Pokémon — loves warm places.",
  },
  {
    id: 7,
    name: "Squirtle",
    types: ["Water"],
    image: "💧",
    desc: "Tiny Turtle Pokémon — loves swimming.",
  },
  {
    id: 25,
    name: "Pikachu",
    types: ["Electric"],
    image: "⚡",
    desc: "Mouse Pokémon — energetic and popular.",
  },
  {
    id: 39,
    name: "Jigglypuff",
    types: ["Fairy"],
    image: "🎵",
    desc: "Balloon Pokémon — sings to put others to sleep.",
  },
  {
    id: 52,
    name: "Meowth",
    types: ["Normal"],
    image: "🐱",
    desc: "Scratch Cat Pokémon — loves shiny objects.",
  },
  {
    id: 133,
    name: "Eevee",
    types: ["Normal"],
    image: "🦊",
    desc: "Evolution Pokémon — has multiple evolutions.",
  },
  {
    id: 150,
    name: "Mewtwo",
    types: ["Psychic"],
    image: "🧠",
    desc: "Genetic Pokémon — powerful and mysterious.",
  },
  {
    id: 94,
    name: "Gengar",
    types: ["Ghost", "Poison"],
    image: "👻",
    desc: "Shadow Pokémon — mischievous.",
  },
  {
    id: 6,
    name: "Charizard",
    types: ["Fire", "Flying"],
    image: "🐉",
    desc: "Flame Pokémon — flies and breathes fire.",
  },
  {
    id: 149,
    name: "Dragonite",
    types: ["Dragon", "Flying"],
    image: "🐲",
    desc: "Dragon Pokémon — strong and friendly.",
  },
  {
    id: 3,
    name: "Venusaur",
    types: ["Grass", "Poison"],
    image: "🌺",
    desc: "Seed Pokémon — robust and large.",
  },
];

const ITEMS_PER_PAGE = 6;

export default function Pokedex() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPokemon, setSelectedPokemon] = useState<
    (typeof samplePokemon)[0] | null
  >(null);

  const totalPages = Math.ceil(samplePokemon.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPokemon = samplePokemon.slice(startIndex, endIndex);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Grass: "bg-green-500/20 text-green-700 dark:text-green-300",
      Poison: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
      Fire: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
      Water: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
      Electric: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
      Fairy: "bg-pink-500/20 text-pink-700 dark:text-pink-300",
      Normal: "bg-gray-500/20 text-gray-700 dark:text-gray-300",
      Psychic: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
      Ghost: "bg-violet-500/20 text-violet-700 dark:text-violet-300",
      Dragon: "bg-red-500/20 text-red-700 dark:text-red-300",
      Flying: "bg-sky-500/20 text-sky-700 dark:text-sky-300",
    };
    return colors[type] || "bg-gray-500/20 text-gray-700";
  };

  return (
    <>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Explorar Pokémons</h1>

        <p className="text-muted-foreground">
          Navegue pela lista de Pokémons disponíveis
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentPokemon.map((pokemon, index) => (
          <Card
            key={pokemon.id}
            className="p-6 hover-lift cursor-pointer animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => setSelectedPokemon(pokemon)}
          >
            <div className="text-center mb-4">
              <div className="text-6xl mb-3">{pokemon.image}</div>

              <h3 className="text-xl font-bold mb-2">{pokemon.name}</h3>

              <div className="flex gap-2 justify-center mb-3">
                {pokemon.types.map((type) => (
                  <Badge key={type} className={getTypeColor(type)}>
                    {type}
                  </Badge>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">{pokemon.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 animate-slide-up">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => setCurrentPage(page)}
            className={
              currentPage === page ? "gradient-primary border-0 text-white" : ""
            }
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {selectedPokemon && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedPokemon(null)}
        >
          <Card
            className="max-w-md w-full p-8 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-8xl mb-4">{selectedPokemon.image}</div>

              <h2 className="text-2xl font-bold mb-3">
                {selectedPokemon.name}
              </h2>

              <div className="flex gap-2 justify-center mb-4">
                {selectedPokemon.types.map((type) => (
                  <Badge key={type} className={getTypeColor(type)}>
                    {type}
                  </Badge>
                ))}
              </div>

              <p className="text-muted-foreground mb-6">
                {selectedPokemon.desc}
              </p>

              <Button
                onClick={() => setSelectedPokemon(null)}
                className="w-full"
              >
                Voltar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
