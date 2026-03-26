import "server-only";

import { z } from "zod";

const envServerSchema = z.object({
  BACKEND_URL: z.url(),
  ACCESS_TOKEN_MAX_AGE: z.coerce.number().int().positive(),
  ACCESS_TOKEN_COOKIE_NAME: z.string().min(1),
  REFRESH_TOKEN_MAX_AGE: z.coerce.number().int().positive(),
  REFRESH_TOKEN_COOKIE_NAME: z.string().min(1),
});

const envServerResult = envServerSchema.safeParse(process.env);

if (!envServerResult.success) {
  throw new Error(
    `Invalid server environment variables:\n${z.prettifyError(envServerResult.error)}`,
  );
}

export const envServer = envServerResult.data;
