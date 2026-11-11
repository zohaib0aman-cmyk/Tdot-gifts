import { z } from "zod";
import { body, clientIp, route } from "@/lib/api";
import { HttpError, hashPassword, rateLimit, startCustomerSession, supabaseAuthClient } from "@/lib/auth";
import { getCustomerByEmail, newId, saveCustomer } from "@/lib/db";

const schema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.email().max(160),
  password: z.string().min(8, "Use at least 8 characters").max(128),
  marketing: z.boolean().optional(),
});

export const POST = route(async (req) => {
  if (!rateLimit(`su:${clientIp(req)}`, 5)) throw new HttpError(429, "Too many attempts — please wait a minute.");
  const d = await body(req, schema);
  const email = d.email.toLowerCase();
  const existing = await getCustomerByEmail(email);
  if (existing?.passwordHash || (existing && supabaseAuthClient())) throw new HttpError(409, "An account with this email already exists. Try signing in.");
  const sb = supabaseAuthClient();
  if (sb) {
    const { error } = await sb.auth.signUp({ email, password: d.password, options: { data: { first_name: d.firstName, last_name: d.lastName } } });
    if (error) throw new HttpError(400, error.message);
  }
  const customer = {
    id: existing?.id ?? newId("c"),
    email,
    firstName: d.firstName,
    lastName: d.lastName,
    passwordHash: sb ? undefined : await hashPassword(d.password),
    addresses: existing?.addresses ?? [],
    wishlist: existing?.wishlist ?? [],
    marketing: !!d.marketing,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  await saveCustomer(customer);
  await startCustomerSession(customer.id, email);
  return { ok: true };
});
