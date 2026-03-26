import "server-only";

import { envServer } from "@/config/env.server";
import { ApiError } from "@/lib/api/error";
import type { ApiResult } from "@/types";

type ApiMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

interface ApiRequestOptions extends Omit<RequestInit, "body" | "method"> {
  body?: Record<string, unknown> | FormData | string | null;
}

const buildUrl = (path: string): string => {
  return new URL(path, envServer.BACKEND_URL).toString();
};

const request = async <T>(
  method: ApiMethod,
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResult<T>> => {
  const { body, headers, ...restOptions } = options;
  const resolvedHeaders = new Headers(headers);
  const requestBody =
    body === null || body === undefined
      ? undefined
      : body instanceof FormData || typeof body === "string"
        ? body
        : JSON.stringify(body);

  if (!(body instanceof FormData) && requestBody !== undefined) {
    resolvedHeaders.set("Content-Type", "application/json");
  }

  resolvedHeaders.set("Accept", "application/json");

  const response = await fetch(buildUrl(path), {
    ...restOptions,
    method,
    headers: resolvedHeaders,
    body: requestBody,
    cache: "no-store",
    credentials: "include",
  });

  const contentType = response.headers.get("content-type");
  const payload =
    response.status === 204
      ? null
      : contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

  if (!response.ok) {
    throw ApiError.fromResponse(response.status, payload);
  }

  return {
    data: payload as T,
    headers: response.headers,
    status: response.status,
  };
};

const get = async <T>(
  path: string,
  options?: Omit<ApiRequestOptions, "body">,
): Promise<ApiResult<T>> => {
  return request<T>("GET", path, options);
};

const post = async <T>(
  path: string,
  body?: ApiRequestOptions["body"],
  options?: Omit<ApiRequestOptions, "body">,
): Promise<ApiResult<T>> => {
  return request<T>("POST", path, {
    ...options,
    body,
  });
};

const put = async <T>(
  path: string,
  body?: ApiRequestOptions["body"],
  options?: Omit<ApiRequestOptions, "body">,
): Promise<ApiResult<T>> => {
  return request<T>("PUT", path, {
    ...options,
    body,
  });
};

const patch = async <T>(
  path: string,
  body?: ApiRequestOptions["body"],
  options?: Omit<ApiRequestOptions, "body">,
): Promise<ApiResult<T>> => {
  return request<T>("PATCH", path, {
    ...options,
    body,
  });
};

const del = async <T>(
  path: string,
  options?: Omit<ApiRequestOptions, "body">,
): Promise<ApiResult<T>> => {
  return request<T>("DELETE", path, options);
};

export const api = {
  delete: del,
  get,
  patch,
  post,
  put,
};
