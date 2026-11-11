import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const ogSize = { width: 1200, height: 630 };

/** Branded Open Graph card (rendered at request time). */
export async function brandedOg({ eyebrow, title, subtitle, price }: { eyebrow: string; title: string; subtitle?: string; price?: string }) {
  const logo = await readFile(path.join(process.cwd(), "public/brand/logo-badge.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(135deg,#1d1416,#0f0a0b)", color: "#f6efe6", padding: 72, fontFamily: "serif", position: "relative" }}>
        <div style={{ position: "absolute", right: -120, top: -120, width: 520, height: 520, borderRadius: 999, background: "radial-gradient(circle, rgba(201,161,74,.35), transparent 65%)", display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={96} height={96} style={{ borderRadius: 999 }} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 34, letterSpacing: 4 }}>GIFTS & SURPRISES</div>
              <div style={{ fontSize: 18, letterSpacing: 12, color: "#c9a14a" }}>USA</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 22, letterSpacing: 6, color: "#c9a14a", textTransform: "uppercase" }}>{eyebrow}</div>
            <div style={{ fontSize: 72, lineHeight: 1.05, maxWidth: 980 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 30, color: "#cdbfb3", maxWidth: 900 }}>{subtitle}</div>}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 26, color: "#cdbfb3" }}>
            <div>Delivering surprises across the USA</div>
            {price && <div style={{ background: "#c9a14a", color: "#1d1406", padding: "12px 28px", borderRadius: 999, fontSize: 32 }}>{price}</div>}
          </div>
        </div>
      </div>
    ),
    ogSize,
  );
}
