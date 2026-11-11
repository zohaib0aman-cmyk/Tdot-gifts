"use client";
import { useSyncExternalStore } from "react";

/** Minimal theme store: class on <html>, persisted to localStorage, follows the OS until the user chooses. */
const KEY = "gs-theme";
const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
};
const read = () => (document.documentElement.classList.contains("dark") ? "dark" : "light");

export function useTheme() {
  const resolvedTheme = useSyncExternalStore(subscribe, read, () => "light");
  const setTheme = (t: "light" | "dark") => {
    document.documentElement.classList.toggle("dark", t === "dark");
    document.documentElement.style.colorScheme = t;
    try { localStorage.setItem(KEY, t); } catch { /* ignore */ }
  };
  return { resolvedTheme, setTheme };
}

/** Inline, render-blocking script that sets the theme before first paint (no flash). */
export const themeScript = `(function(){document.documentElement.classList.add("js");try{var t=localStorage.getItem("${KEY}");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}}catch(e){}})()`;
