import { z } from "zod";
import { body, clientIp, route } from "@/lib/api";
import { HttpError, rateLimit, startCustomerSession, supabaseAuthClient, verifyPassword } from "@/lib/auth";
import { getCustomerByEmail, newId, saveCustomer } from "@/lib/db";

export const POST = route(async (req) => {
  if (!rateLimit(`li:${clientIp(req)}`, 8)) throw new HttpError(429, "Too many attempts — please wait a minute.");
  const { email: raw, password } = await body(req, z.object({ email: z.email().max(160), password: z.string().min(1).max(128) }));
  const email = raw.toLowerCase();
  let customer = await getCustomerByEmail(email);
  const sb = supabaseAuthClient();
  if (sb) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw new HttpError(401, "Incorrect email or password.");
    if (!customer) {
      const meta = data.user.user_metadata ?? {};
      customer = { id: newId("c"), email, firstName: meta.first_name ?? "", lastName: meta.last_name ?? "", addresses: [], wishlist: [], marketing: false, createdAt: new Date().toISOString() };
      await saveCustomer(customer);
    }
  } else if (!customer || !(await verifyPassword(password, customer.passwordHash))) {
    throw new HttpError(401, "Incorrect email or password.");
  }
  await startCustomerSession(customer.id, email);
  return { ok: true, wishlist: customer.wishlist };
});
