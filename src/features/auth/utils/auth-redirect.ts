const LOGIN_PATHNAME = "/login";
const SESSION_REFRESH_PATHNAME = "/api/auth/refresh";
const AUTH_REDIRECT_BASE_URL = "http://local.test";
export const FORCE_LOGIN_QUERY_PARAM = "forceLogin";

const BLOCKED_REDIRECT_PREFIXES = [
  LOGIN_PATHNAME,
  "/register",
  "/verify-email",
  "/api",
] as const;

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
  options?: {
    forceLogin?: boolean;
  },
): string => {
  const loginUrl = new URL(LOGIN_PATHNAME, AUTH_REDIRECT_BASE_URL);
  const normalizedRedirectTarget = normalizeAuthRedirectTarget(redirectTo);

  if (normalizedRedirectTarget) {
    loginUrl.searchParams.set("redirectTo", normalizedRedirectTarget);
  }

  if (options?.forceLogin) {
    loginUrl.searchParams.set(FORCE_LOGIN_QUERY_PARAM, "1");
  }

  return `${loginUrl.pathname}${loginUrl.search}`;
};

export const buildSessionRefreshPath = (
  redirectTo?: string | null,
): string => {
  const refreshUrl = new URL(SESSION_REFRESH_PATHNAME, AUTH_REDIRECT_BASE_URL);
  const normalizedRedirectTarget = normalizeAuthRedirectTarget(redirectTo);

  if (normalizedRedirectTarget) {
    refreshUrl.searchParams.set("redirectTo", normalizedRedirectTarget);
  }

  return `${refreshUrl.pathname}${refreshUrl.search}`;
};
