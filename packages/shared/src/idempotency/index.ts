import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import type { ScopedClient } from "../db/client.js";

/**
 * Generates a deterministic idempotency key from a prefix and parts.
 * Same inputs always produce the same key.
 */
export function generateIdempotencyKey(prefix: string, ...parts: string[]): string {
    const input = [prefix, ...parts].join(":");
    return createHash("sha256").update(input).digest("hex");
}

/**
 * Checks if an operation with the given idempotency key has already been processed.
 * Returns the stored result or null if not found.
 */
export async function checkIdempotency(db: ScopedClient, key: string): Promise<unknown | null> {
    const rows = await db.execute<{ result: unknown }>(
        sql`SELECT result FROM outbox.idempotency_keys WHERE key = ${key}`,
    );
    if (rows.length === 0) return null;
    return rows[0].result;
}

/**
 * Records the result of an idempotent operation.
 * Uses INSERT ... ON CONFLICT to handle concurrent calls safely.
 */
export async function recordIdempotency(
    db: ScopedClient,
    key: string,
    result: unknown,
): Promise<void> {
    await db.execute(
        sql`INSERT INTO outbox.idempotency_keys (key, result, created_at)
            VALUES (${key}, ${JSON.stringify(result)}::jsonb, NOW())
            ON CONFLICT (key) DO NOTHING`,
    );
}
