import { z } from "zod";
import { body, route } from "@/lib/api";
import { HttpError } from "@/lib/auth";
import { generateGiftCode, listGiftCards, newId, saveGiftCard } from "@/lib/db";
import { sendGiftCardEmail } from "@/lib/email";

export const POST = route(async (req) => {
  const d = await body(req, z.object({ amount: z.number().min(1).max(5000), recipientName: z.string().trim().max(80).optional(), recipientEmail: z.email().optional().or(z.literal("")), message: z.string().max(300).optional(), send: z.boolean().optional() }));
  const card = { id: newId("gc"), code: generateGiftCode(), initialBalance: d.amount, balance: d.amount, recipientName: d.recipientName || undefined, recipientEmail: d.recipientEmail || undefined, senderName: "Gifts & Surprises USA", message: d.message, active: true, createdAt: new Date().toISOString() };
  await saveGiftCard(card);
  if (d.send && card.recipientEmail) await sendGiftCardEmail(card);
  return { card };
}, { admin: true });

export const PATCH = route(async (req) => {
  const d = await body(req, z.object({ id: z.string().max(64), active: z.boolean().optional(), balance: z.number().min(0).max(5000).optional() }));
  const card = (await listGiftCards()).find((g) => g.id === d.id);
  if (!card) throw new HttpError(404, "Gift card not found");
  await saveGiftCard({ ...card, ...(d.active != null && { active: d.active }), ...(d.balance != null && { balance: d.balance }) });
  return { ok: true };
}, { admin: true });
