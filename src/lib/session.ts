import { SignJWT, jwtVerify } from "jose";

/** Session token helpers shared by the proxy (edge) and server code. */
export const ADMIN_COOKIE = "gs_admin";
export const CUSTOMER_COOKIE = "gs_session";

const secret = () =>
  new TextEncoder().encode(process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me-please-0123456789");

export type AdminSession = { role: "admin"; email: string };
export type CustomerSession = { role: "customer"; cid: string; email: string };

export async function signSession(payload: AdminSession | CustomerSession, maxAgeSec: number) {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSec)
    .sign(secret());
}

export async function verifySession<T extends AdminSession | CustomerSession>(token: string | undefined, role: T["role"]): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return payload.role === role ? (payload as unknown as T) : null;
  } catch {
    return null;
  }
}
