import { z } from "zod";
import { body, route } from "@/lib/api";
import { HttpError } from "@/lib/auth";
import { getOrder } from "@/lib/db";
import { finalizeOrder, markOrder } from "@/lib/orders";
import { paypalCapture } from "@/lib/payments";

export const POST = route(async (req) => {
  const { orderId } = await body(req, z.object({ orderId: z.string().min(1).max(64) }));
  const order = await getOrder(orderId);
  if (!order?.paypalOrderId) throw new HttpError(404, "PayPal order not found");
  const res = await paypalCapture(order.paypalOrderId);
  if (!res.ok || res.reference !== order.id) {
    await markOrder(order.id, "failed", "PayPal payment was not completed");
    throw new HttpError(402, "PayPal payment was not completed.");
  }
  await finalizeOrder(order.id, { paymentMethod: "paypal", paypalCaptureId: res.captureId });
  return { status: "paid", orderId: order.id };
});
