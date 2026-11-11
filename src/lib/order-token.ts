import "server-only";
import { jwtVerify, SignJWT } from "jose";
import type { Order } from "./types";

/**
 * Demo-mode only: a signed snapshot of a pending order so a payment that lands on a
 * different serverless instance (no shared database) can still be completed.
 * Signed with SESSION_SECRET, so it can't be forged or have its prices changed.
 */
const key = () => new TextEncoder().encode(`${process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me-please-0123456789"}:order`);

export const signOrder = (o: Order) =>
  new SignJWT({ o } as unknown as Record<string, unknown>).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("2h").sign(key());

export async function verifyOrder(token?: string): Promise<Order | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return (payload as unknown as { o: Order }).o ?? null;
  } catch {
    return null;
  }
}
