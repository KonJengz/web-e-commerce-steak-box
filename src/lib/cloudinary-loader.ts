"use client";

// Cloudinary loader for Next.js Image component
// Docs: https://nextjs.org/docs/app/api-reference/components/image#loader

type CloudinaryLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: CloudinaryLoaderProps): string {
  // If not a Cloudinary URL, return as-is but with query params to satisfy Next.js Image loader requirements
  if (!src.includes("res.cloudinary.com")) {
    // Next.js requires the loader to return a URL that includes the width
    return `${src}?w=${width}&q=${quality || 95}`;
  }

  // Insert transformation params before /upload/
  const params = [
    `w_${width}`,
    `q_${quality || 95}`,
    "f_auto", // auto format (webp/avif)
    "c_limit", // resize without cropping
  ].join(",");

  return src.replace("/upload/", `/upload/${params}/`);
}
