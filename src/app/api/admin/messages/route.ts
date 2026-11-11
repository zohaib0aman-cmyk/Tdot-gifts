import { z } from "zod";
import { body, route } from "@/lib/api";
import { HttpError } from "@/lib/auth";
import { listMessages, updateMessage } from "@/lib/db";

export const PATCH = route(async (req) => {
  const { id, handled } = await body(req, z.object({ id: z.string().max(64), handled: z.boolean() }));
  const m = (await listMessages()).find((x) => x.id === id);
  if (!m) throw new HttpError(404, "Message not found");
  await updateMessage({ ...m, handled });
  return { ok: true };
}, { admin: true });
