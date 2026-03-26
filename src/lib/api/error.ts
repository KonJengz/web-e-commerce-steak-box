import type { ApiErrorResponse } from "@/types";

const isApiErrorResponse = (value: unknown): value is ApiErrorResponse => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const error = (value as { error?: unknown }).error;

  if (typeof error !== "object" || error === null) {
    return false;
  }

  const errorRecord = error as Record<string, unknown>;

  return (
    typeof errorRecord.status === "number" &&
    typeof errorRecord.message === "string"
  );
};

interface ApiErrorOptions {
  message: string;
  payload: unknown;
  status: number;
}

export class ApiError extends Error {
  public readonly payload: unknown;
  public readonly status: number;

  constructor({ message, payload, status }: ApiErrorOptions) {
    super(message);

    this.name = "ApiError";
    this.payload = payload;
    this.status = status;
  }

  public static fromResponse(status: number, payload: unknown): ApiError {
    if (isApiErrorResponse(payload)) {
      return new ApiError({
        message: payload.error.message,
        payload,
        status: payload.error.status,
      });
    }

    return new ApiError({
      message: "Something went wrong while calling the backend.",
      payload,
      status,
    });
  }
}
