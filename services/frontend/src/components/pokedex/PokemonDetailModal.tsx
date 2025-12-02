import { formatPokedexNumber, getTypeBadgeClass } from "@/lib/pokemon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PokemonDetail } from "@/types/pokemon";

interface PokemonDetailModalProps {
  open: boolean;
  onClose: () => void;
  data: PokemonDetail | null;
}

export default function PokemonDetailModal({
  open,
  onClose,
  data,
}: PokemonDetailModalProps) {
  if (!open || !data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <Card
        className="max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-32 h-32 flex items-center justify-center">
            {data.image ? (
              <img
                src={data.image}
                alt={data.name}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-4xl">❓</div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-baseline gap-3">
              <div className="text-sm text-muted-foreground">
                {formatPokedexNumber(data.id)}
              </div>
              <h3 className="text-xl font-bold capitalize">{data.name}</h3>
            </div>

            <div className="flex gap-2 mt-2 flex-wrap">
              {(data.types ?? []).map((t) => (
                <span
                  key={t.name}
                  className={`text-sm px-2 py-0.5 rounded-md font-medium ${getTypeBadgeClass(
                    t.name
                  )}`}
                >
                  {t.name}
                </span>
              ))}
            </div>

            {data.description && (
              <p className="text-sm text-muted-foreground mt-3">
                {data.description}
              </p>
            )}

            {data.weaknesses && data.weaknesses.length > 0 && (
              <div className="mt-3">
                <div className="text-sm text-muted-foreground">Fraquezas</div>
                <div className="flex gap-2 flex-wrap mt-2">
                  {data.weaknesses.map((w) => (
                    <span
                      key={w}
                      className={`text-xs px-2 py-0.5 rounded ${getTypeBadgeClass(
                        w
                      )}`}
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.baseStats && (
              <div className="mt-4">
                <div className="text-sm text-muted-foreground">Stats</div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  {Object.entries(data.baseStats).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <div className="capitalize">{k}</div>
                      <div>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <Button onClick={onClose} className="w-full">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
