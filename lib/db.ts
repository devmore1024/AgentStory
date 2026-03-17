import { Pool } from "pg";

declare global {
  var __agentStoryPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return new Pool({
    connectionString,
    max: 10
  });
}

export const pool = global.__agentStoryPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  global.__agentStoryPool = pool;
}

export async function sql<T>(
  query: string,
  values: ReadonlyArray<string | number | boolean | null> = []
) {
  return pool.query<T>(query, values);
}

export function isMissingRelationError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: string };
  return candidate.code === "42P01" || candidate.code === "42703";
}
