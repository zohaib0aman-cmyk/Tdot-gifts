import { brandedOg, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Gifts & Surprises USA — luxury gifts and birthday surprises";

export default function Image() {
  return brandedOg({ eyebrow: "Surprise planners", title: "Gifts that make hearts skip a beat", subtitle: "Roses, celebration cakes, treat baskets & full surprise setups — ordered from anywhere." });
}
