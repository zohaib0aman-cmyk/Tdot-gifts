import { revalidatePath } from "next/cache";
import { body, route } from "@/lib/api";
import { settingsSchema } from "@/lib/admin-schemas";
import { saveSettings } from "@/lib/db";

export const PUT = route(async (req) => {
  const s = await body(req, settingsSchema);
  await saveSettings(s);
  revalidatePath("/", "layout");
  return { settings: s };
}, { admin: true });
