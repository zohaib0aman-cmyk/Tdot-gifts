import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { body, route } from "@/lib/api";
import { HttpError } from "@/lib/auth";
import { env, hasSupabase } from "@/lib/env";
import { newId } from "@/lib/db";

const BUCKET = "product-images";

/** Accepts a client-resized image (data URL). Stores it in Supabase Storage when configured; otherwise keeps it inline. */
export const POST = route(async (req) => {
  const { dataUrl } = await body(req, z.object({ dataUrl: z.string().max(2_200_000) }));
  const m = /^data:(image\/(png|jpeg|webp|gif|avif));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) throw new HttpError(400, "Upload a PNG, JPG, WebP, GIF or AVIF image.");
  const bytes = Buffer.from(m[3], "base64");
  if (bytes.length > 1_600_000) throw new HttpError(413, "Image is too large (max 1.5 MB after compression).");
  if (!hasSupabase()) return { url: dataUrl, storage: "inline" };
  const sb = createClient(env.supabaseUrl, env.supabaseServiceKey, { auth: { persistSession: false } });
  await sb.storage.createBucket(BUCKET, { public: true }).catch(() => {});
  const path = `${new Date().toISOString().slice(0, 7)}/${newId("img")}.${m[2] === "jpeg" ? "jpg" : m[2]}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, bytes, { contentType: m[1], cacheControl: "31536000", upsert: false });
  if (error) throw new HttpError(500, `Upload failed: ${error.message}`);
  return { url: sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl, storage: "supabase" };
}, { admin: true });
