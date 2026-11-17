import { z } from "zod";

const baseSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  RUN_MODE: z.enum(["demo", "connected"]).default("demo"),
  DEMO_MODE: z.enum(["true", "false"]).default("true"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

export type AppEnvironment = z.infer<typeof baseSchema>;

export function readEnvironment(env: NodeJS.ProcessEnv = process.env): AppEnvironment {
  return baseSchema.parse(env);
}

export function isConnectedMode(env: NodeJS.ProcessEnv = process.env) {
  return env.RUN_MODE === "connected";
}

export function hasSupabaseConfiguration(env: NodeJS.ProcessEnv = process.env) {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function assertConnectedConfiguration(
  env: NodeJS.ProcessEnv = process.env,
) {
  if (!isConnectedMode(env)) return;
  const parsed = readEnvironment(env);
  const missing = [
    !parsed.NEXT_PUBLIC_SUPABASE_URL && "NEXT_PUBLIC_SUPABASE_URL",
    !parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    !parsed.SUPABASE_SERVICE_ROLE_KEY && "SUPABASE_SERVICE_ROLE_KEY",
  ].filter(Boolean);
  if (missing.length) {
    throw new Error(
      `Connected mode is missing required environment variables: ${missing.join(", ")}`,
    );
  }
}
