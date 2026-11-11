import { z } from "zod";
import { body, route } from "@/lib/api";
import { HttpError } from "@/lib/auth";
import { getOrder, saveOrder } from "@/lib/db";
import { paypalCreateOrder } from "@/lib/payments";

export const POST = route(async (req) => {
  const { orderId } = await body(req, z.object({ orderId: z.string().min(1).max(64) }));
  const order = await getOrder(orderId);
  if (!order || order.status !== "pending") throw new HttpError(404, "Order not available for payment");
  const id = await paypalCreateOrder(order.total, order.id);
  await saveOrder({ ...order, paypalOrderId: id });
  return { id };
});
