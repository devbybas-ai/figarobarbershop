import { z } from "zod/v4";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_").optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

function validateClientEnv() {
  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!result.success) {
    const formatted = z.prettifyError(result.error);
    console.error("Invalid client environment variables:\n", formatted);
    throw new Error("Invalid client environment variables.");
  }

  return result.data;
}

export const clientEnv = validateClientEnv();
