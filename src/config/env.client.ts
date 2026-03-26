import { z } from "zod";

const envClientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
});

const envClientResult = envClientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

if (!envClientResult.success) {
  throw new Error(
    `Invalid client environment variables:\n${z.prettifyError(envClientResult.error)}`,
  );
}

export const envClient = envClientResult.data;
