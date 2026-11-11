import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

const OPTIMIZABLE = /^(\/(?!.*\.svg$)|https:\/\/([a-z0-9-]+\.)*supabase\.co\/|https:\/\/images\.unsplash\.com\/)/;

/** next/image wrapper: local photos & Supabase uploads are optimised (AVIF/WebP); SVG art, inline uploads and other hosts render as-is. */
export function ProductImage({ src, alt, className, ...rest }: Omit<ImageProps, "src"> & { src: string }) {
  return <Image src={src} alt={alt} className={cn("object-cover", className)} unoptimized={!OPTIMIZABLE.test(src)} {...rest} />;
}
