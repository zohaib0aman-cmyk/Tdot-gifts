"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** One observer for every [data-reveal] / [data-stagger] element on the page. */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible),[data-stagger]:not(.is-visible)");
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("is-visible")); return; }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach((e) => io.observe(e));
    // content added later (client navigation / filtering)
    const mo = new MutationObserver(() => document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible):not([data-observed]),[data-stagger]:not(.is-visible):not([data-observed])").forEach((e) => { e.dataset.observed = ""; io.observe(e); }));
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [pathname]);
  return null;
}
