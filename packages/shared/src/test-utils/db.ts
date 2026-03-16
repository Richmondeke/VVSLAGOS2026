import { sql } from "drizzle-orm";
import type { ScopedClient } from "../db/client.js";

/**
 * Wraps a test function in a database transaction that is always rolled back.
 * Ensures test isolation — no data persists between tests.
 */
export async function withTestTransaction(
    db: ScopedClient,
    fn: (tx: ScopedClient) => Promise<void>,
): Promise<void> {
    await db.execute(sql`BEGIN`);
    try {
        await fn(db);
    } finally {
        await db.execute(sql`ROLLBACK`);
    }
}

/**
 * Seeds minimal data into the test database.
 * Creates all schemas if they don't exist.
 */
export async function seedTestDb(db: ScopedClient): Promise<void> {
    const schemas = [
        "auth",
        "members",
        "marketplace",
        "finance",
        "social",
        "platform",
        "reporting",
        "outbox",
    ];
    for (const schema of schemas) {
        await db.execute(sql.raw(`CREATE SCHEMA IF NOT EXISTS ${schema}`));
    }
}
