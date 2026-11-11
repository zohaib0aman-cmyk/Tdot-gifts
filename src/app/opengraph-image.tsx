import { brandedOg, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Tdot Gifts — luxury gifts and birthday surprises";

export default function Image() {
  return brandedOg({ eyebrow: "Surprise planners", title: "Gifts that make hearts skip a beat", subtitle: "Roses, celebration cakes, treat baskets & full surprise setups — ordered from anywhere." });
}
