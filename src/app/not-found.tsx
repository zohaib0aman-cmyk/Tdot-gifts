import Link from "next/link";
import { Logo } from "@/components/brand";
import { NotFoundView } from "@/components/not-found-view";

export default function GlobalNotFound() {
  return (
    <main id="main" className="min-h-dvh">
      <header className="flex justify-center py-6"><Link href="/" aria-label="Home"><Logo logoUrl="/brand/logo-badge.png" mode="badge+wordmark" /></Link></header>
      <NotFoundView />
    </main>
  );
}
