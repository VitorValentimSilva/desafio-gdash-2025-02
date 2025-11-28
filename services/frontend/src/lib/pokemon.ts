export function formatPokedexNumber(id?: number | null) {
  if (id == null || Number.isNaN(id)) return "—";
  return `#${String(id).padStart(3, "0")}`;
}

export function getTypeBadgeClass(type: string): string {
  if (!type) return "bg-gray-200 text-gray-800";

  const key = String(type).toLowerCase();

  const map: Record<string, string> = {
    grass:
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
    poison:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200",
    fire: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
    water: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
    electric:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200",
    fairy: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200",
    normal:
      "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200",
    psychic:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200",
    ghost:
      "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
    dragon:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
    flying: "bg-sky-50 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200",
    ground:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    rock: "bg-stone-100 text-stone-800 dark:bg-stone-900/40 dark:text-stone-200",
    ice: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200",
    bug: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-200",
    steel:
      "bg-slate-200 text-slate-900 dark:bg-slate-800/30 dark:text-slate-100",
    dark: "bg-slate-700 text-white",
    fighting: "bg-red-700/20 text-red-800 dark:text-red-300",
  };

  return (
    map[key] ??
    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200"
  );
}
