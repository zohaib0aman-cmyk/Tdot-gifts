import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gifts & Surprises USA",
    short_name: "Gifts & Surprises",
    description: "Luxury gifts & birthday surprises delivered across the USA.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf6ef",
    theme_color: "#16110f",
    icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }, { src: "/brand/logo-badge.png", sizes: "512x512", type: "image/png" }],
  };
}
