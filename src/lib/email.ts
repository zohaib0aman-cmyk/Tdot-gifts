import "server-only";
import { env } from "./env";
import { getSettings, logEmail } from "./db";
import type { GiftCard, Order } from "./types";
import { money } from "./utils";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const fill = (tpl: string, vars: Record<string, string>) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");

function shell(title: string, body: string, storeName: string) {
  return `<!doctype html><html><body style="margin:0;background:#f6efe6;font-family:Helvetica,Arial,sans-serif;color:#1d1416">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden">
<tr><td style="background:#16110f;padding:28px;text-align:center;color:#f6efe6;font-family:Georgia,serif;font-size:22px;letter-spacing:3px">GIFTS <span style="color:#c9a14a">&amp;</span> SURPRISES<div style="font-size:11px;letter-spacing:8px;color:#c9a14a;margin-top:6px">USA</div></td></tr>
<tr><td style="padding:32px 32px 8px"><h1 style="font-family:Georgia,serif;font-weight:normal;font-size:26px;margin:0 0 12px">${esc(title)}</h1>${body}</td></tr>
<tr><td style="padding:24px 32px 32px;color:#8a7a75;font-size:12px;text-align:center">${esc(storeName)} · Delivering surprises across the USA<br/>Questions? Just reply to this email.</td></tr>
</table></td></tr></table></body></html>`;
}

async function send(to: string, subject: string, html: string, template: string) {
  let status: "sent" | "logged" | "failed" = "logged";
  if (env.resendKey) {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${env.resendKey}`, "content-type": "application/json" },
        body: JSON.stringify({ from: env.emailFrom, to: [to], subject, html }),
      });
      status = r.ok ? "sent" : "failed";
    } catch {
      status = "failed";
    }
  }
  await logEmail({ to, subject, html, template, status });
  return status;
}

export async function sendOrderConfirmation(order: Order) {
  const s = await getSettings();
  const t = s.emailTemplates.orderConfirmation;
  const vars = { orderNumber: order.number, firstName: order.shippingAddress.firstName, storeName: s.storeName };
  const rows = order.lines
    .map((l) => `<tr><td style="padding:10px 0;border-bottom:1px solid #eee">${esc(l.name)}${l.variantLabel ? ` <span style="color:#8a7a75">· ${esc(l.variantLabel)}</span>` : ""} × ${l.quantity}${l.giftMessage ? `<div style="color:#8a7a75;font-style:italic;font-size:13px">“${esc(l.giftMessage)}”</div>` : ""}</td><td align="right" style="padding:10px 0;border-bottom:1px solid #eee">${money(l.unitPrice * l.quantity)}</td></tr>`)
    .join("");
  const line = (k: string, v: string, bold = false) => `<tr><td style="padding:4px 0;${bold ? "font-weight:bold;font-size:16px" : "color:#6b5a5d"}">${k}</td><td align="right" style="padding:4px 0;${bold ? "font-weight:bold;font-size:16px" : ""}">${v}</td></tr>`;
  const a = order.shippingAddress;
  const site = env.siteUrl;
  const body = `<p style="line-height:1.6;color:#4a3a3d">${esc(fill(t.intro, vars))}</p>
<p style="margin:20px 0;padding:14px 18px;background:#f6efe6;border-radius:14px">Order <strong>${order.number}</strong> · ${esc(order.shippingLabel)}${order.deliveryDate ? ` · Requested delivery ${esc(order.deliveryDate)}` : ""}</p>
<table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px">${line("Subtotal", money(order.subtotal))}${order.discount ? line(`Discount${order.promoCode ? ` (${esc(order.promoCode)})` : ""}`, `−${money(order.discount)}`) : ""}${order.giftWrapTotal ? line("Gift wrap", money(order.giftWrapTotal)) : ""}${line("Shipping", order.shipping ? money(order.shipping) : "Free")}${line("Tax", money(order.tax))}${order.giftCardApplied ? line("Gift card", `−${money(order.giftCardApplied)}`) : ""}${line("Total paid", money(order.total), true)}</table>
<p style="margin-top:20px;color:#6b5a5d;line-height:1.6"><strong style="color:#1d1416">Delivering to</strong><br/>${esc(`${a.firstName} ${a.lastName}`)}<br/>${esc(a.line1)}${a.line2 ? `, ${esc(a.line2)}` : ""}<br/>${esc(`${a.city}, ${a.state} ${a.zip}`)}</p>
<p style="text-align:center;margin:28px 0 8px"><a href="${site}/track/${order.id}" style="background:#16110f;color:#fbf7ef;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:bold">Track your order</a></p>`;
  return send(order.email, fill(t.subject, vars), shell("Thank you for your order", body, s.storeName), "order_confirmation");
}

export async function sendShippedEmail(order: Order) {
  const s = await getSettings();
  const t = s.emailTemplates.shipped;
  const vars = { orderNumber: order.number, firstName: order.shippingAddress.firstName, storeName: s.storeName };
  const body = `<p style="line-height:1.6;color:#4a3a3d">${esc(fill(t.intro, vars))}</p>
${order.trackingNumber ? `<p style="padding:14px 18px;background:#f6efe6;border-radius:14px">${esc((order.trackingCarrier ?? "").toUpperCase())} tracking: <strong>${esc(order.trackingNumber)}</strong></p>` : ""}
<p style="text-align:center;margin:28px 0 8px"><a href="${env.siteUrl}/track/${order.id}" style="background:#16110f;color:#fbf7ef;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:bold">Track your order</a></p>`;
  return send(order.email, fill(t.subject, vars), shell("Your gift is on its way", body, s.storeName), "shipped");
}

export async function sendGiftCardEmail(card: GiftCard) {
  if (!card.recipientEmail) return;
  const s = await getSettings();
  const t = s.emailTemplates.giftCard;
  const vars = { senderName: card.senderName ?? "Someone special", recipientName: card.recipientName ?? "", storeName: s.storeName };
  const body = `<p style="line-height:1.6;color:#4a3a3d">Hi ${esc(card.recipientName ?? "there")}, ${esc(fill(t.intro, vars))}</p>
${card.message ? `<p style="font-family:Georgia,serif;font-style:italic;font-size:18px;padding:16px;border-left:3px solid #c9a14a">“${esc(card.message)}”<br/><span style="font-size:13px;color:#8a7a75">— ${esc(card.senderName ?? "")}</span></p>` : ""}
<div style="margin:24px 0;padding:28px;background:#16110f;border-radius:20px;text-align:center;color:#f6efe6"><div style="font-size:12px;letter-spacing:4px;color:#c9a14a">GIFT CARD</div><div style="font-family:Georgia,serif;font-size:40px;margin:8px 0">${money(card.balance)}</div><div style="font-family:monospace;font-size:20px;letter-spacing:3px">${esc(card.code)}</div></div>
<p style="text-align:center"><a href="${env.siteUrl}/shop" style="background:#c9a14a;color:#1d1406;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:bold">Start shopping</a></p>`;
  return send(card.recipientEmail, fill(t.subject, vars), shell("You've received a gift card", body, s.storeName), "gift_card");
}

export async function sendRefundEmail(order: Order, amount: number) {
  const s = await getSettings();
  const body = `<p style="line-height:1.6;color:#4a3a3d">Hi ${esc(order.shippingAddress.firstName)}, we've issued a refund of <strong>${money(amount)}</strong> for order ${order.number} to your original payment method. It can take 5–10 business days to appear on your statement.</p>`;
  return send(order.email, `Refund issued for order ${order.number}`, shell("Your refund is on its way", body, s.storeName), "refund");
}

export async function sendContactNotice(name: string, email: string, topic: string, message: string) {
  const s = await getSettings();
  const body = `<p><strong>${esc(name)}</strong> (${esc(email)}) — ${esc(topic)}</p><p style="white-space:pre-wrap;line-height:1.6">${esc(message)}</p>`;
  return send(s.contact.email, `New enquiry: ${topic}`, shell("New contact form message", body, s.storeName), "contact");
}
