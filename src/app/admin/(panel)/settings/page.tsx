import { PageHeader, Panel } from "@/components/admin/shell";
import { SettingsEditor } from "@/components/admin/settings-editor";
import { getSettings } from "@/lib/db";
import { hasPayPal, hasStripe, hasSupabase } from "@/lib/env";
import { cn } from "@/lib/utils";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const s = await getSettings();
  const integrations = [
    { name: "Supabase database & storage", ok: hasSupabase(), hint: "NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY" },
    { name: "Stripe (test mode)", ok: hasStripe(), hint: "STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET" },
    { name: "PayPal (sandbox)", ok: hasPayPal(), hint: "NEXT_PUBLIC_PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET" },
    { name: "Resend email delivery", ok: Boolean(process.env.RESEND_API_KEY), hint: "RESEND_API_KEY, EMAIL_FROM" },
  ];
  return (
    <>
      <PageHeader title="Settings" sub="Shipping, taxes, emails, policies and integrations." />
      <Panel title="Integrations" className="mb-5">
        <ul className="grid gap-2 sm:grid-cols-2">
          {integrations.map((i) => (
            <li key={i.name} className="flex items-start gap-3 rounded-2xl border border-line p-3">
              <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", i.ok ? "bg-emerald-500" : "bg-amber-500")} />
              <span className="min-w-0"><span className="block text-sm font-semibold">{i.name}</span><span className="block text-xs text-muted">{i.ok ? "Connected" : `Demo mode — set ${i.hint}`}</span></span>
            </li>
          ))}
        </ul>
      </Panel>
      <SettingsEditor initial={s} mode="settings" />
    </>
  );
}
