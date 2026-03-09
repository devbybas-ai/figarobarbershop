import { z } from "zod/v4";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),

  // Stripe (optional until integration is live)
  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_").optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),

  // Instagram (optional until integration is live)
  INSTAGRAM_APP_ID: z.string().min(1).optional(),
  INSTAGRAM_APP_SECRET: z.string().min(1).optional(),
  INSTAGRAM_ACCESS_TOKEN: z.string().min(1).optional(),

  // Resend (optional until email integration is live)
  RESEND_API_KEY: z.string().startsWith("re_").optional(),

  // Default password for new barber accounts
  DEFAULT_BARBER_PASSWORD: z.string().min(8).optional(),

  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = z.prettifyError(result.error);
    console.error("Invalid environment variables:\n", formatted);
    throw new Error("Invalid environment variables. Check server logs for details.");
  }

  return result.data;
}

export const env = validateEnv();
export type Env = z.infer<typeof envSchema>;
