import { z } from "zod";
import { body, route } from "@/lib/api";
import { getCurrentCustomer } from "@/lib/auth";
import { saveCustomer } from "@/lib/db";

export const POST = route(async (req) => {
  const { ids } = await body(req, z.object({ ids: z.array(z.string().max(64)).max(200) }));
  const c = await getCurrentCustomer();
  if (!c) return { synced: false };
  await saveCustomer({ ...c, wishlist: ids });
  return { synced: true };
});
