import {
  attemptRefreshAccessToken,
  type RefreshAccessTokenResult,
  type RefreshedAuthSession,
} from "@/lib/auth-helpers";

const refreshFlights = new Map<string, Promise<RefreshAccessTokenResult>>();

export const attemptRefreshAccessTokenSingleFlight = async (
  refreshToken: string,
): Promise<RefreshAccessTokenResult> => {
  const inFlightRefresh = refreshFlights.get(refreshToken);

  if (inFlightRefresh) {
    return inFlightRefresh;
  }

  const refreshPromise = attemptRefreshAccessToken(refreshToken).finally(() => {
    refreshFlights.delete(refreshToken);
  });

  refreshFlights.set(refreshToken, refreshPromise);

  return refreshPromise;
};

export const refreshAccessTokenSingleFlight = async (
  refreshToken: string,
): Promise<RefreshedAuthSession | null> => {
  const result = await attemptRefreshAccessTokenSingleFlight(refreshToken);

  return result.session;
};
