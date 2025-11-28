import { getTypeBadgeClass, formatPokedexNumber } from "@/lib/pokemon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PokemonUi } from "@/types/pokemon";

export default function PokemonDetailModal({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: PokemonUi | null;
}) {
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
        <div className="flex gap-4">
          <div className="w-32 h-32 flex items-center justify-center">
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

            <div className="flex gap-2 mt-2">
              {(data.types ?? []).map((t: string) => (
                <span
                  key={t}
                  className={`text-sm px-2 py-0.5 rounded-md font-medium ${getTypeBadgeClass(
                    t
                  )}`}
                >
                  {t}
                </span>
              ))}
            </div>

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
