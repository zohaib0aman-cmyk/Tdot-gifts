"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartLine } from "./types";

/* ------------------------------------------------------------ cart */
interface CartState {
  lines: CartLine[];
  promoCode?: string;
  giftCardCode?: string;
  /** increments on every add — drives the cart icon bounce */
  bump: number;
  add: (line: CartLine) => void;
  setQty: (key: string, qty: number) => void;
  update: (key: string, patch: Partial<CartLine>) => void;
  remove: (key: string) => void;
  clear: () => void;
  setPromo: (code?: string) => void;
  setGiftCard: (code?: string) => void;
}

export const lineKey = (productId: string, variantId?: string, extra = "") => `${productId}|${variantId ?? "-"}${extra ? `|${extra}` : ""}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      bump: 0,
      add: (line) =>
        set((s) => {
          const existing = s.lines.find((l) => l.key === line.key);
          const lines = existing
            ? s.lines.map((l) => (l.key === line.key ? { ...l, ...line, quantity: Math.min(20, l.quantity + line.quantity) } : l))
            : [...s.lines, line];
          return { lines, bump: s.bump + 1 };
        }),
      setQty: (key, qty) => set((s) => ({ lines: s.lines.map((l) => (l.key === key ? { ...l, quantity: Math.max(1, Math.min(20, qty)) } : l)) })),
      update: (key, patch) => set((s) => ({ lines: s.lines.map((l) => (l.key === key ? { ...l, ...patch } : l)) })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [], promoCode: undefined, giftCardCode: undefined }),
      setPromo: (promoCode) => set({ promoCode }),
      setGiftCard: (giftCardCode) => set({ giftCardCode }),
    }),
    { name: "gs-cart", storage: createJSONStorage(() => localStorage), partialize: (s) => ({ lines: s.lines, promoCode: s.promoCode, giftCardCode: s.giftCardCode }) },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((a, l) => a + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((a, l) => a + l.unitPrice * l.quantity, 0);

/* ------------------------------------------------------------ wishlist */
interface WishState {
  ids: string[];
  toggle: (id: string) => boolean;
  has: (id: string) => boolean;
  set: (ids: string[]) => void;
}
export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const on = !get().ids.includes(id);
        set({ ids: on ? [...get().ids, id] : get().ids.filter((x) => x !== id) });
        // best-effort sync for signed-in customers
        fetch("/api/account/wishlist", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: get().ids }) }).catch(() => {});
        return on;
      },
      has: (id) => get().ids.includes(id),
      set: (ids) => set({ ids }),
    }),
    { name: "gs-wishlist", storage: createJSONStorage(() => localStorage) },
  ),
);

/* ------------------------------------------------------------ ui */
interface UIState {
  cartOpen: boolean;
  menuOpen: boolean;
  searchOpen: boolean;
  setCart: (v: boolean) => void;
  setMenu: (v: boolean) => void;
  setSearch: (v: boolean) => void;
}
export const useUI = create<UIState>()((set) => ({
  cartOpen: false,
  menuOpen: false,
  searchOpen: false,
  setCart: (cartOpen) => set({ cartOpen, menuOpen: false }),
  setMenu: (menuOpen) => set({ menuOpen }),
  setSearch: (searchOpen) => set({ searchOpen }),
}));

/* ------------------------------------------------------------ toasts */
export type Toast = { id: number; title: string; description?: string; tone?: "success" | "error" | "info"; image?: string; action?: { label: string; href?: string; onClick?: () => void } };
interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}
let tid = 0;
export const useToasts = create<ToastState>()((set) => ({
  toasts: [],
  push: (t) => {
    const id = ++tid;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 4200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));
export const toast = (t: Omit<Toast, "id">) => useToasts.getState().push(t);

/** Hydration guard for persisted stores. */
import { useSyncExternalStore } from "react";
const noop = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}
