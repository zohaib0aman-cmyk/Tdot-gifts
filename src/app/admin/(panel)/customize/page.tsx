import { PageHeader } from "@/components/admin/shell";
import { SettingsEditor } from "@/components/admin/settings-editor";
import { getSettings } from "@/lib/db";

export const metadata = { title: "Customize" };

export default async function CustomizePage() {
  const s = await getSettings();
  return (
    <>
      <PageHeader title="Customize storefront" sub="Logo, colors, fonts, hero, homepage layout, announcement bar and footer — no code needed." />
      <SettingsEditor initial={s} mode="customize" />
    </>
  );
}
