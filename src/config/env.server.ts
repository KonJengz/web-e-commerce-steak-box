import "server-only";

import { z } from "zod";

const envServerSchema = z.object({
  BACKEND_URL: z.string().url().default("http://localhost:4000"),
  ACCESS_TOKEN_COOKIE_NAME: z.string().min(1).default("access_token"),
});

export const envServer = envServerSchema.parse({
  BACKEND_URL: process.env.BACKEND_URL,
  ACCESS_TOKEN_COOKIE_NAME: process.env.ACCESS_TOKEN_COOKIE_NAME,
});
