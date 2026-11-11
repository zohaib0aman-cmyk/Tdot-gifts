"use client";
import { ImagePlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/lib/client-store";
import { cn } from "@/lib/utils";

/** Resize in the browser (max 1400px, WebP) before uploading — keeps pages fast. */
async function compress(file: File, max = 1400): Promise<string> {
  if (file.type === "image/svg+xml") throw new Error("SVG uploads aren't allowed for security reasons — use PNG, JPG or WebP.");
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  let q = 0.86;
  let url = canvas.toDataURL("image/webp", q);
  while (url.length > 1_900_000 && q > 0.4) { q -= 0.12; url = canvas.toDataURL("image/webp", q); }
  return url;
}

export function ImageUploadButton({ onUploaded, multiple = true, className, label = "Upload images" }: { onUploaded: (url: string) => void; multiple?: boolean; className?: string; label?: string }) {
  const [busy, setBusy] = useState(0);
  const handle = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      setBusy((b) => b + 1);
      try {
        const dataUrl = await compress(f);
        const r = await fetch("/api/admin/upload", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ dataUrl }) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        onUploaded(j.url);
      } catch (e) {
        toast({ title: "Upload failed", description: e instanceof Error ? e.message : String(e), tone: "error" });
      }
      setBusy((b) => b - 1);
    }
  };
  return (
    <label
      className={cn("flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line bg-surface-2/40 p-3 text-center text-xs font-semibold text-muted transition hover:border-gold hover:text-fg", className)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); void handle(e.dataTransfer.files); }}
    >
      {busy ? <Loader2 size={22} className="animate-spin" /> : <ImagePlus size={22} />}
      {busy ? "Uploading…" : label}
      <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" multiple={multiple} className="sr-only" onChange={(e) => { void handle(e.target.files); e.target.value = ""; }} />
    </label>
  );
}
