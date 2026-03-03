import { z } from "zod";

export const DEFAULT_DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(1).optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  DEMO_USER_ID: z.string().uuid().optional(),
  SKIP_ENV_VALIDATION: z.enum(["true", "false"]).optional(),
});

const envInput = {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  DEMO_USER_ID:
    process.env.DEMO_USER_ID ??
    (process.env.NODE_ENV === "production" ? undefined : DEFAULT_DEMO_USER_ID),
  SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION,
};

const parsed = envSchema.safeParse(envInput);

if (!parsed.success) {
  if (process.env.SKIP_ENV_VALIDATION === "true") {
    // Keep startup flexible for scripts/tests when explicitly requested.
    console.warn("Environment validation skipped due to SKIP_ENV_VALIDATION=true");
  } else {
    throw new Error(
      `Invalid environment variables:\n${parsed.error.issues
        .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
        .join("\n")}`,
    );
  }
}

export const env = parsed.success ? parsed.data : envInput;
