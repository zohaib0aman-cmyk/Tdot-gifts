import { Toaster } from "@/components/chrome";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main id="main" className="min-h-dvh bg-bg">{children}</main>
      <Toaster />
    </>
  );
}
