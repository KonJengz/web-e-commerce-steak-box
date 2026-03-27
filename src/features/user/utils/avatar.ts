import type { User } from "@/features/user/types/user.type";

const AVATAR_PROXY_PATH = "/api/avatar";

const REMOTE_AVATAR_HOST_PATTERNS = [
  /(^|\.)googleusercontent\.com$/i,
  /(^|\.)githubusercontent\.com$/i,
  /^res\.cloudinary\.com$/i,
] as const;

const AVATAR_CANVAS_SIZE = 160;

const sanitizeAvatarSeed = (value: string): string => {
  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : "User";
};

const hashAvatarSeed = (seed: string): number => {
  return seed.split("").reduce((hashValue, character) => {
    return ((hashValue << 5) - hashValue + character.charCodeAt(0)) >>> 0;
  }, 2166136261);
};

const getAvatarInitials = (seed: string): string => {
  const normalizedSeed = sanitizeAvatarSeed(seed)
    .split("@")[0]
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim();
  const parts = normalizedSeed.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

const escapeSvgText = (value: string): string => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
};

const parseAbsoluteHttpUrl = (value: string): URL | null => {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url;
  } catch {
    return null;
  }
};

const buildAvatarProxyUrl = (src: string, seed: string): string => {
  const searchParams = new URLSearchParams({
    seed: sanitizeAvatarSeed(seed),
    src,
  });

  return `${AVATAR_PROXY_PATH}?${searchParams.toString()}`;
};

export const isProxyableAvatarUrl = (value: string): boolean => {
  const url = parseAbsoluteHttpUrl(value);

  if (!url) {
    return false;
  }

  return REMOTE_AVATAR_HOST_PATTERNS.some((pattern) =>
    pattern.test(url.hostname),
  );
};

export const buildFallbackAvatarSvg = (seed: string): string => {
  const normalizedSeed = sanitizeAvatarSeed(seed);
  const initials = escapeSvgText(getAvatarInitials(normalizedSeed));
  const seedHash = hashAvatarSeed(normalizedSeed);
  const primaryHue = seedHash % 360;
  const secondaryHue = (primaryHue + 38) % 360;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${AVATAR_CANVAS_SIZE} ${AVATAR_CANVAS_SIZE}" role="img" aria-label="Profile avatar">
      <defs>
        <linearGradient id="avatar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(${primaryHue} 72% 54%)" />
          <stop offset="100%" stop-color="hsl(${secondaryHue} 72% 44%)" />
        </linearGradient>
      </defs>
      <rect width="${AVATAR_CANVAS_SIZE}" height="${AVATAR_CANVAS_SIZE}" rx="${AVATAR_CANVAS_SIZE / 2}" fill="url(#avatar-gradient)" />
      <circle cx="118" cy="38" r="28" fill="rgba(255,255,255,0.16)" />
      <circle cx="44" cy="132" r="22" fill="rgba(255,255,255,0.08)" />
      <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="52" font-weight="700" letter-spacing="2">
        ${initials}
      </text>
    </svg>
  `.trim();
};

export const buildFallbackAvatar = (seed: string): string => {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildFallbackAvatarSvg(seed))}`;
};

export const resolveUserAvatar = (
  email: User["email"],
  image: User["image"],
): string => {
  const avatarSeed = sanitizeAvatarSeed(email);
  const normalizedImage = image?.trim();

  if (!normalizedImage) {
    return buildFallbackAvatar(avatarSeed);
  }

  if (
    normalizedImage.startsWith("/") ||
    normalizedImage.startsWith("blob:") ||
    normalizedImage.startsWith("data:")
  ) {
    return normalizedImage;
  }

  if (isProxyableAvatarUrl(normalizedImage)) {
    return buildAvatarProxyUrl(normalizedImage, avatarSeed);
  }

  return normalizedImage;
};
