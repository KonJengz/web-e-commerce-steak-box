import { refreshAccessToken, type RefreshedAuthSession } from "@/lib/auth-helpers";

const refreshFlights = new Map<string, Promise<RefreshedAuthSession | null>>();

export const refreshAccessTokenSingleFlight = async (
  refreshToken: string,
): Promise<RefreshedAuthSession | null> => {
  const inFlightRefresh = refreshFlights.get(refreshToken);

  if (inFlightRefresh) {
    return inFlightRefresh;
  }

  const refreshPromise = refreshAccessToken(refreshToken).finally(() => {
    refreshFlights.delete(refreshToken);
  });

  refreshFlights.set(refreshToken, refreshPromise);

  return refreshPromise;
};
