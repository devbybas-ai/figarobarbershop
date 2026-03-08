import { z } from "zod/v4";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.url(),

  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),

  INSTAGRAM_APP_ID: z.string().min(1),
  INSTAGRAM_APP_SECRET: z.string().min(1),
  INSTAGRAM_ACCESS_TOKEN: z.string().min(1),

  RESEND_API_KEY: z.string().startsWith("re_"),

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
