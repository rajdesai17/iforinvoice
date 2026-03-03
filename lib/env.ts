import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEON_AUTH_BASE_URL: z.string().min(1, "NEON_AUTH_BASE_URL is required"),
  NEON_AUTH_COOKIE_SECRET: z.string().min(1, "NEON_AUTH_COOKIE_SECRET is required"),
  NEON_PROJECT_ID: z.string().optional(),
  SKIP_ENV_VALIDATION: z.enum(["true", "false"]).optional(),
});

const envInput = {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  NEON_AUTH_BASE_URL: process.env.NEON_AUTH_BASE_URL,
  NEON_AUTH_COOKIE_SECRET: process.env.NEON_AUTH_COOKIE_SECRET,
  NEON_PROJECT_ID: process.env.NEON_PROJECT_ID,
  SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION,
};

const parsed = envSchema.safeParse(envInput);

if (!parsed.success) {
  if (process.env.SKIP_ENV_VALIDATION === "true") {
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
