import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
    REDIS_URL: z.string().url("REDIS_URL must be a valid URL").default("redis://localhost:6379"),
    JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates and returns environment variables.
 * Fails fast with a clear error if required vars are missing.
 */
export function loadEnv(): Env {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        const formatted = result.error.issues
            .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
            .join("\n");
        console.error(`\nEnvironment validation failed:\n${formatted}\n`);
        process.exit(1);
    }

    return result.data;
}
