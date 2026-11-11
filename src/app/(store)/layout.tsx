import { CartDrawer } from "@/components/cart";
import { BottomNav, CookieBanner, Toaster } from "@/components/chrome";
import { Footer } from "@/components/footer";
import { AnnouncementBar, Header, MobileMenu } from "@/components/header";
import { RevealObserver } from "@/components/reveal-observer";
import { SearchSheet } from "@/components/search";
import { getSettings } from "@/lib/db";

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  return (
    <>
      <AnnouncementBar />
      <Header />
      <MobileMenu />
      <SearchSheet />
      <main id="main" className="min-h-[60vh]">{children}</main>
      <Footer settings={settings} />
      <BottomNav />
      <CartDrawer />
      <Toaster />
      <CookieBanner />
      <RevealObserver />
    </>
  );
}
