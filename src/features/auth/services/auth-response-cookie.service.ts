import type { NextResponse } from "next/server";

import { envServer } from "@/config/env.server";
import type { RequestAuthSession } from "@/features/auth/services/request-auth-session.service";

const isProduction = process.env.NODE_ENV === "production";

export const setAccessTokenResponseCookie = (
  response: NextResponse,
  accessToken: string,
): void => {
  response.cookies.set({
    httpOnly: true,
    maxAge: envServer.ACCESS_TOKEN_MAX_AGE,
    name: envServer.ACCESS_TOKEN_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: accessToken,
  });
};

export const setRefreshTokenResponseCookie = (
  response: NextResponse,
  refreshToken: string,
): void => {
  response.cookies.set({
    httpOnly: true,
    maxAge: envServer.REFRESH_TOKEN_MAX_AGE,
    name: envServer.REFRESH_TOKEN_COOKIE_NAME,
    path: "/",
    sameSite: "strict",
    secure: isProduction,
    value: refreshToken,
  });
};

export const clearAuthResponseCookies = (response: NextResponse): NextResponse => {
  response.cookies.set({
    httpOnly: true,
    maxAge: 0,
    name: envServer.ACCESS_TOKEN_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: "",
  });

  response.cookies.set({
    httpOnly: true,
    maxAge: 0,
    name: envServer.REFRESH_TOKEN_COOKIE_NAME,
    path: "/",
    sameSite: "strict",
    secure: isProduction,
    value: "",
  });

  return response;
};

export const applyResolvedSessionCookies = (
  response: NextResponse,
  session: RequestAuthSession,
): NextResponse => {
  if (!session.refreshedSession) {
    return response;
  }

  setAccessTokenResponseCookie(response, session.accessToken);

  if (session.refreshedSession.refreshToken) {
    setRefreshTokenResponseCookie(response, session.refreshedSession.refreshToken);
  } else {
    response.cookies.set({
      httpOnly: true,
      maxAge: 0,
      name: envServer.REFRESH_TOKEN_COOKIE_NAME,
      path: "/",
      sameSite: "strict",
      secure: isProduction,
      value: "",
    });
  }

  return response;
};
