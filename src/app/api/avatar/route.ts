import type { NextRequest } from "next/server";

import {
  buildFallbackAvatarSvg,
  isProxyableAvatarUrl,
} from "@/features/user/utils/avatar";

const SUCCESS_CACHE_CONTROL =
  "public, max-age=3600, stale-while-revalidate=86400";
const FALLBACK_CACHE_CONTROL = "public, max-age=60, stale-while-revalidate=300";
const AVATAR_FETCH_TIMEOUT_MS = 5_000;
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

const buildFallbackResponse = (seed: string): Response => {
  return new Response(buildFallbackAvatarSvg(seed), {
    headers: {
      "Cache-Control": FALLBACK_CACHE_CONTROL,
      "Content-Type": "image/svg+xml; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
    status: 200,
  });
};

export async function GET(request: NextRequest): Promise<Response> {
  const source = request.nextUrl.searchParams.get("src")?.trim();
  const seed = request.nextUrl.searchParams.get("seed")?.trim() || "User";

  if (!source || !isProxyableAvatarUrl(source)) {
    return buildFallbackResponse(seed);
  }

  try {
    const upstreamResponse = await fetch(source, {
      headers: {
        Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
      },
      next: {
        revalidate: 3600,
      },
      redirect: "manual",
      signal: AbortSignal.timeout(AVATAR_FETCH_TIMEOUT_MS),
    });

    const contentType = upstreamResponse.headers.get("content-type");
    const contentLengthHeader = upstreamResponse.headers.get("content-length");
    const contentLength =
      contentLengthHeader === null ? null : Number(contentLengthHeader);

    if (
      !upstreamResponse.ok ||
      upstreamResponse.type === "opaqueredirect" ||
      !contentType?.startsWith("image/")
    ) {
      return buildFallbackResponse(seed);
    }

    if (
      contentLength !== null &&
      Number.isFinite(contentLength) &&
      contentLength > AVATAR_MAX_BYTES
    ) {
      return buildFallbackResponse(seed);
    }

    const avatarBytes = await upstreamResponse.arrayBuffer();

    if (avatarBytes.byteLength > AVATAR_MAX_BYTES) {
      return buildFallbackResponse(seed);
    }

    return new Response(avatarBytes, {
      headers: {
        "Cache-Control": SUCCESS_CACHE_CONTROL,
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
      status: 200,
    });
  } catch {
    return buildFallbackResponse(seed);
  }
}
