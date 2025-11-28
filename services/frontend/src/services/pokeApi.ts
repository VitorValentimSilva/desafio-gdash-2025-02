import api from "@/lib/api";

export interface PokeListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{ name: string; url: string }>;
}

export async function pokeList(limit = 20, offset = 0) {
  const r = await api.get<PokeListResponse>(
    `/external/poke?limit=${limit}&offset=${offset}`
  );
  return r.data;
}

export async function pokeDetail(nameOrId: string | number) {
  const r = await api.get(`/external/poke/${nameOrId}`);
  return r.data;
}
