/** Shared (server + client) parsing of shop URL filters. */
export type ShopFilters = { q: string; category: string[]; occasion: string[]; recipient: string[]; min: number; max: number; sort: string; view: "grid" | "list" };
export const PRICE_MAX = 400;

export function parseFilters(get: (k: string) => string | null, getAll: (k: string) => string[]): ShopFilters {
  const num = (v: string | null, d: number) => (v && !Number.isNaN(Number(v)) ? Math.max(0, Math.min(PRICE_MAX, Number(v))) : d);
  return {
    q: (get("q") ?? "").slice(0, 60),
    category: getAll("category"),
    occasion: getAll("occasion"),
    recipient: getAll("recipient"),
    min: num(get("min"), 0),
    max: num(get("max"), PRICE_MAX),
    sort: get("sort") ?? "featured",
    view: get("view") === "list" ? "list" : "grid",
  };
}

