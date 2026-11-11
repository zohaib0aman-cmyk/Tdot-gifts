import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { env, hasSupabase } from "./env";
import { SEED_PRODUCTS } from "@/data/catalog";
import { SEED_REVIEWS } from "@/data/reviews";
import { DEFAULT_SETTINGS } from "@/data/settings";
import { DEMO_CUSTOMERS, DEMO_GIFT_CARDS, DEMO_ORDERS, DEMO_PROMOS } from "@/data/demo-history";

/**
 * A tiny document store with two interchangeable backends:
 *  - Supabase (Postgres `documents` table, see supabase/schema.sql) when env vars are present
 *  - An in-process store persisted to .data/db.json for local demos / previews
 * All access happens on the server; the browser never talks to the database directly.
 */
export type Collection =
  | "products" | "reviews" | "orders" | "customers" | "promos" | "giftcards"
  | "emails" | "messages" | "subscribers" | "settings";

type Doc = { id: string } & Record<string, unknown>;

interface Backend {
  all(c: Collection): Promise<Doc[]>;
  get(c: Collection, id: string): Promise<Doc | null>;
  put(c: Collection, doc: Doc): Promise<void>;
  putMany(c: Collection, docs: Doc[]): Promise<void>;
  remove(c: Collection, id: string): Promise<void>;
}

const seedData = (): Record<Collection, Doc[]> => ({
  products: SEED_PRODUCTS as unknown as Doc[],
  reviews: SEED_REVIEWS as unknown as Doc[],
  orders: DEMO_ORDERS as unknown as Doc[],
  customers: DEMO_CUSTOMERS as unknown as Doc[],
  promos: DEMO_PROMOS as unknown as Doc[],
  giftcards: DEMO_GIFT_CARDS as unknown as Doc[],
  emails: [],
  messages: [],
  subscribers: [],
  settings: [{ id: "site", ...DEFAULT_SETTINGS } as unknown as Doc],
});

/* ------------------------------------------------------------------ memory */
type MemDB = Record<Collection, Map<string, Doc>>;
const g = globalThis as unknown as { __gsdb?: MemDB; __gsdbTimer?: NodeJS.Timeout };
// Serverless hosts (Vercel) only allow writes to /tmp — fine for demos; use Supabase for production.
const DATA_FILE = path.join(process.env.DATA_DIR || (process.env.VERCEL ? "/tmp/gs-data" : path.join(process.cwd(), ".data")), "db.json");
const canPersist = true;

function loadMem(): MemDB {
  if (g.__gsdb) return g.__gsdb;
  let raw: Record<string, Doc[]> | null = null;
  if (canPersist) {
    try {
      raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    } catch {
      raw = null;
    }
  }
  const src = raw ?? seedData();
  const db = {} as MemDB;
  (Object.keys(seedData()) as Collection[]).forEach((c) => {
    db[c] = new Map((src[c] ?? seedData()[c]).map((d) => [d.id, structuredClone(d)]));
  });
  g.__gsdb = db;
  return db;
}
function persist() {
  if (!canPersist) return;
  clearTimeout(g.__gsdbTimer);
  g.__gsdbTimer = setTimeout(() => {
    try {
      const db = loadMem();
      const out: Record<string, Doc[]> = {};
      for (const [k, m] of Object.entries(db)) out[k] = [...m.values()];
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(out));
    } catch {
      /* read-only FS: keep in memory */
    }
  }, 150);
}

const memory: Backend = {
  async all(c) { return [...loadMem()[c].values()].map((d) => structuredClone(d)); },
  async get(c, id) { const d = loadMem()[c].get(id); return d ? structuredClone(d) : null; },
  async put(c, doc) { loadMem()[c].set(doc.id, structuredClone(doc)); persist(); },
  async putMany(c, docs) { const m = loadMem()[c]; docs.forEach((d) => m.set(d.id, structuredClone(d))); persist(); },
  async remove(c, id) { loadMem()[c].delete(id); persist(); },
};

/* ------------------------------------------------------------------ supabase */
let sb: SupabaseClient | null = null;
let seeded: Promise<void> | null = null;
const supa = () => (sb ??= createClient(env.supabaseUrl, env.supabaseServiceKey, { auth: { persistSession: false } }));

async function ensureSeeded() {
  seeded ??= (async () => {
    const { data, error } = await supa().from("documents").select("id").eq("collection", "settings").eq("id", "site").maybeSingle();
    if (error) throw new Error(`Supabase: ${error.message}. Did you run supabase/schema.sql?`);
    if (data) return;
    const all = seedData();
    for (const c of Object.keys(all) as Collection[]) {
      const rows = all[c].map((d) => ({ collection: c, id: d.id, data: d }));
      for (let i = 0; i < rows.length; i += 200) await supa().from("documents").upsert(rows.slice(i, i + 200));
    }
  })();
  return seeded;
}

const supabase: Backend = {
  async all(c) {
    await ensureSeeded();
    const out: Doc[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supa().from("documents").select("data").eq("collection", c).range(from, from + 999);
      if (error) throw error;
      out.push(...(data ?? []).map((r) => r.data as Doc));
      if (!data || data.length < 1000) break;
    }
    return out;
  },
  async get(c, id) {
    await ensureSeeded();
    const { data, error } = await supa().from("documents").select("data").eq("collection", c).eq("id", id).maybeSingle();
    if (error) throw error;
    return (data?.data as Doc) ?? null;
  },
  async put(c, doc) {
    await ensureSeeded();
    const { error } = await supa().from("documents").upsert({ collection: c, id: doc.id, data: doc, updated_at: new Date().toISOString() });
    if (error) throw error;
  },
  async putMany(c, docs) {
    await ensureSeeded();
    const { error } = await supa().from("documents").upsert(docs.map((d) => ({ collection: c, id: d.id, data: d, updated_at: new Date().toISOString() })));
    if (error) throw error;
  },
  async remove(c, id) {
    await ensureSeeded();
    const { error } = await supa().from("documents").delete().eq("collection", c).eq("id", id);
    if (error) throw error;
  },
};

export const backendName = () => (hasSupabase() ? "supabase" : "demo");
const backend = (): Backend => (hasSupabase() ? supabase : memory);

export const store = {
  all: <T,>(c: Collection) => backend().all(c) as Promise<T[]>,
  get: <T,>(c: Collection, id: string) => backend().get(c, id) as Promise<T | null>,
  put: <T extends { id: string },>(c: Collection, doc: T) => backend().put(c, doc as unknown as Doc).then(() => doc),
  putMany: <T extends { id: string },>(c: Collection, docs: T[]) => backend().putMany(c, docs as unknown as Doc[]),
  remove: (c: Collection, id: string) => backend().remove(c, id),
};

export const newId = (prefix: string) => `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
