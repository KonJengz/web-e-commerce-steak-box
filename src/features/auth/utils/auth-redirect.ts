const LOGIN_PATHNAME = "/login";
const AUTH_REDIRECT_BASE_URL = "http://local.test";

const BLOCKED_REDIRECT_PREFIXES = [LOGIN_PATHNAME, "/verify-email"] as const;

export const normalizeAuthRedirectTarget = (
  value: string | null | undefined,
): string | null => {
  const candidate = value?.trim();

  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return null;
  }

  if (
    BLOCKED_REDIRECT_PREFIXES.some((blockedPrefix) =>
      candidate.startsWith(blockedPrefix),
    )
  ) {
    return null;
  }

  return candidate;
};

export const resolveAuthRedirectTarget = (
  value: string | null | undefined,
  fallbackPath: string,
): string => {
  return normalizeAuthRedirectTarget(value) ?? fallbackPath;
};

export const buildLoginRedirectPath = (
  redirectTo?: string | null,
): string => {
  const loginUrl = new URL(LOGIN_PATHNAME, AUTH_REDIRECT_BASE_URL);
  const normalizedRedirectTarget = normalizeAuthRedirectTarget(redirectTo);

  if (normalizedRedirectTarget) {
    loginUrl.searchParams.set("redirectTo", normalizedRedirectTarget);
  }

  return `${loginUrl.pathname}${loginUrl.search}`;
};
