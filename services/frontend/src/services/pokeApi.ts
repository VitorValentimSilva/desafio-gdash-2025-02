import type {
  ListParams,
  PagedResult,
  PokemonDetail,
  SearchParams,
  TypesParams,
} from "@/types/pokemon";

const BASE = (import.meta.env.VITE_POKE_API_BASE as string) ?? "/api/poke";

type Primitive = string | number | boolean;
type QueryValue = Primitive | null | undefined | Array<Primitive>;

function buildQuery(params: Record<string, QueryValue>) {
  const esc = (s: Primitive) => encodeURIComponent(String(s));
  const q: string[] = [];

  for (const key of Object.keys(params)) {
    const v = params[key];
    if (v === undefined || v === null) continue;

    if (Array.isArray(v)) {
      if (v.length === 0) continue;
      const encoded = v.map((item) => esc(item)).join(",");
      q.push(`${encodeURIComponent(key)}=${encoded}`);
    } else {
      q.push(`${encodeURIComponent(key)}=${esc(v)}`);
    }
  }

  return q.length ? `?${q.join("&")}` : "";
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const maybeJson = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = maybeJson?.message ?? res.statusText ?? "Erro na requisição";
    throw new Error(msg);
  }
  return maybeJson as T;
}

export async function listPokemons({
  limit = 20,
  offset = 0,
  order = "pokedex",
  signal,
}: ListParams = {}): Promise<PagedResult> {
  const q = buildQuery({ limit, offset, order });
  const res = await fetch(`${BASE}/${q}`, { method: "GET", signal });
  return handleResponse<PagedResult>(res);
}

export async function searchPokemons({
  q: query = "",
  limit = 20,
  offset = 0,
  order = "pokedex",
  signal,
}: SearchParams): Promise<PagedResult> {
  const qStr = buildQuery({ q: query ?? "", limit, offset, order });
  const res = await fetch(`${BASE}/search${qStr}`, { method: "GET", signal });
  return handleResponse<PagedResult>(res);
}

export async function filterByTypes({
  types,
  limit = 20,
  offset = 0,
  order = "pokedex",
  signal,
}: TypesParams): Promise<PagedResult> {
  const typesParam = Array.isArray(types) ? types.join(",") : types ?? "";
  const qStr = buildQuery({ types: typesParam, limit, offset, order });
  const res = await fetch(`${BASE}/types${qStr}`, { method: "GET", signal });
  return handleResponse<PagedResult>(res);
}

export async function getPokemonDetail(
  idOrName: string,
  signal?: AbortSignal
): Promise<PokemonDetail> {
  const res = await fetch(`${BASE}/${encodeURIComponent(idOrName)}`, {
    method: "GET",
    signal,
  });
  return handleResponse<PokemonDetail>(res);
}
