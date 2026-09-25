import Image, { type ImageProps } from "next/image";

const OPTIMIZABLE = /^(\/|https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/)/i;

/**
 * next/image wrapper: local and Vercel Blob images are optimised (responsive sizes, AVIF/WebP);
 * images from other authorised hosts (e.g. CSV imports) are rendered without the optimiser.
 */
export function SmartImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const unoptimized = props.unoptimized ?? (src !== "" && !OPTIMIZABLE.test(src));
  return <Image {...props} unoptimized={unoptimized} alt={props.alt} />;
}
