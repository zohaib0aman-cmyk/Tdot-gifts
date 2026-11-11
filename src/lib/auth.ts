import "server-only";
import { cookies } from "next/headers";
import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_COOKIE, CUSTOMER_COOKIE, signSession, verifySession, type AdminSession, type CustomerSession } from "./session";
import { env } from "./env";
import { getCustomer } from "./db";

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const key = await scryptAsync(pw, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}
export async function verifyPassword(pw: string, stored?: string) {
  if (!stored?.startsWith("scrypt$")) return false;
  const [, saltHex, keyHex] = stored.split("$");
  const key = await scryptAsync(pw, Buffer.from(saltHex, "hex"), 64);
  const expected = Buffer.from(keyHex, "hex");
  return expected.length === key.length && timingSafeEqual(expected, key);
}

export function safeEqual(a: string, b: string) {
  const A = Buffer.from(a), B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

const cookieOpts = (maxAge: number) => ({ httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge });

/* ------------------------------------------------------------ admin */
export async function startAdminSession(email: string) {
  const token = await signSession({ role: "admin", email }, 60 * 60 * 12);
  (await cookies()).set(ADMIN_COOKIE, token, cookieOpts(60 * 60 * 12));
}
export async function getAdmin() {
  return verifySession<AdminSession>((await cookies()).get(ADMIN_COOKIE)?.value, "admin");
}
export async function requireAdmin() {
  const a = await getAdmin();
  if (!a) throw new HttpError(401, "Admin authentication required");
  return a;
}
export async function endAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

/* ------------------------------------------------------------ customers */
export async function startCustomerSession(cid: string, email: string) {
  const token = await signSession({ role: "customer", cid, email }, 60 * 60 * 24 * 30);
  (await cookies()).set(CUSTOMER_COOKIE, token, cookieOpts(60 * 60 * 24 * 30));
}
export async function getCustomerSession() {
  return verifySession<CustomerSession>((await cookies()).get(CUSTOMER_COOKIE)?.value, "customer");
}
export async function getCurrentCustomer() {
  const s = await getCustomerSession();
  return s ? getCustomer(s.cid) : null;
}
export async function endCustomerSession() {
  (await cookies()).delete(CUSTOMER_COOKIE);
}

/** When Supabase is configured, credentials are verified by Supabase Auth. */
export function supabaseAuthClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) return null;
  return createClient(env.supabaseUrl, env.supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

/* ------------------------------------------------------------ rate limiting */
const hits = new Map<string, number[]>();
export function rateLimit(key: string, limit = 8, windowMs = 60_000) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length <= limit;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
