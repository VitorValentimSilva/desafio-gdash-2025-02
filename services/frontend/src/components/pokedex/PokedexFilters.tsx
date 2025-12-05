import { getTypeClass } from "@/lib/pokemon";
import type { FiltersState, Order } from "@/types/pokemon";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface PokedexFiltersProps {
  value?: Partial<FiltersState>;
  onChange: (state: FiltersState) => void;
}

export default function PokedexFilters({
  value,
  onChange,
}: PokedexFiltersProps) {
  const [q, setQ] = useState<string>(value?.q ?? "");
  const [order, setOrder] = useState<Order>(value?.order ?? "pokedex");
  const [types, setTypes] = useState<string[]>(value?.types ?? []);

  const [availableTypes, setAvailableTypes] = useState<string[] | null>(null);
  const [typesOpen, setTypesOpen] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [typesError, setTypesError] = useState<string | null>(null);

  const { t } = useTranslation("poke");

  useEffect(() => {
    const t = setTimeout(() => {
      onChange({ q, order, types });
    }, 500);
    return () => clearTimeout(t);
  }, [q, order, types, onChange]);

  useEffect(() => {
    let mounted = true;
    const fetchTypes = async () => {
      setLoadingTypes(true);
      setTypesError(null);

      try {
        const res = await fetch("https://pokeapi.co/api/v2/type");
        if (!res.ok) throw new Error(`Status ${res.status}`);

        const parsed = (await res.json()) as unknown;

        let resultsArr: unknown[] = [];
        if (
          parsed &&
          typeof parsed === "object" &&
          "results" in (parsed as Record<string, unknown>) &&
          Array.isArray((parsed as Record<string, unknown>).results)
        ) {
          resultsArr = (parsed as Record<string, unknown>).results as unknown[];
        }

        const names = resultsArr
          .map((r) =>
            r &&
            typeof r === "object" &&
            typeof (r as Record<string, unknown>).name === "string"
              ? String((r as Record<string, unknown>).name)
              : ""
          )
          .filter(Boolean)
          .filter((n) => n !== "shadow" && n !== "unknown");

        if (mounted) {
          setAvailableTypes(names);
        }
      } catch {
        if (mounted) {
          setTypesError(t("errors.errorLoadingTypesPokemon"));
          setAvailableTypes([]);
        }
      } finally {
        if (mounted) setLoadingTypes(false);
      }
    };

    fetchTypes();

    return () => {
      mounted = false;
    };
  }, [t]);

  const toggleType = (typeName: string) => {
    setTypes((prev) =>
      prev.includes(typeName)
        ? prev.filter((t) => t !== typeName)
        : [...prev, typeName]
    );
  };

  const clearFilters = () => {
    setQ("");
    setOrder("pokedex");
    setTypes([]);
    onChange({ q: "", order: "pokedex", types: [] });
  };

  const typesBadge = useMemo(
    () => (types.length === 0 ? t("all") : `${types.length} ${t("selected")}`),
    [types, t]
  );

  return (
    <div className="bg-surface rounded-md mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-3 items-end">
        <div className="w-full md:w-auto flex-1">
          <Label htmlFor="search" className="mb-2">
            {t("inputs.searchTitle")}
          </Label>

          <Input
            id="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("inputs.searchPlaceholder")}
          />
        </div>

        <div className="w-full md:w-40">
          <Label htmlFor="order" className="mb-2">
            {t("inputs.orderTitle")}
          </Label>

          <Select value={order} onValueChange={(v: Order) => setOrder(v)}>
            <SelectTrigger>
              <SelectValue placeholder={t("inputs.orderPlaceholder")} />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="pokedex">
                {t("inputs.orderOptionNumberPokemon")}
              </SelectItem>
              <SelectItem value="az">
                {t("inputs.orderOptionNameAZ")}
              </SelectItem>
              <SelectItem value="za">
                {t("inputs.orderOptionNameZA")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-56 relative">
          <Label htmlFor="types" className="mb-2">
            {t("inputs.typeTitle")}
          </Label>

          <Button
            id="types"
            variant="outline"
            className="w-full justify-between"
            onClick={() => setTypesOpen((s) => !s)}
          >
            <span className="text-sm text-muted-foreground">{typesBadge}</span>
            <span className="text-xs text-muted-foreground">
              {types.length > 0 ? t("inputs.typeEdit") : t("inputs.typeSelect")}
            </span>
          </Button>

          {typesOpen && (
            <div className="absolute z-50 mt-2 w-full bg-background border rounded-md shadow-lg p-3 max-h-64 overflow-auto">
              {loadingTypes ? (
                <div>{t("loadingTypes")}</div>
              ) : typesError ? (
                <div className="text-red-500">{typesError}</div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {(availableTypes ?? []).map((t) => (
                    <Label
                      key={t}
                      htmlFor={`type-${t}`}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        id={`type-${t}`}
                        checked={types.includes(t)}
                        onCheckedChange={() => toggleType(t)}
                      />
                      <span className={`capitalize ${getTypeClass(t)}`}>
                        {t}
                      </span>
                    </Label>
                  ))}
                </div>
              )}

              <div className="mt-3 flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTypes([]);
                    setTypesOpen(false);
                  }}
                >
                  {t("buttonClear")}
                </Button>

                <Button size="sm" onClick={() => setTypesOpen(false)}>
                  {t("buttonClose")}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-end w-full md:w-auto">
          <Button variant="outline" onClick={clearFilters}>
            {t("buttonCleanAll")}
          </Button>
        </div>
      </div>
    </div>
  );
}
