import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export type ScopedClient = ReturnType<typeof drizzle>;

const clients = new Map<string, { sql: ReturnType<typeof postgres>; db: ScopedClient }>();

/**
 * Creates a Drizzle client scoped to a specific schema.
 * Reuses connections for the same schema + connection string.
 */
export function createScopedClient(schema: string, connectionString?: string): ScopedClient {
    const connStr = connectionString ?? process.env.DATABASE_URL;
    if (!connStr) {
        throw new Error("DATABASE_URL is not set and no connection string provided");
    }

    const key = `${connStr}:${schema}`;
    const existing = clients.get(key);
    if (existing) {
        return existing.db;
    }

    const sql = postgres(connStr, {
        max: 10,
        idle_timeout: 30,
        connect_timeout: 10,
        prepare: false,
        connection: {
            search_path: schema,
        },
    });

    const db = drizzle(sql);
    clients.set(key, { sql, db });
    return db;
}

/**
 * Closes all database connections. Call during graceful shutdown.
 */
export async function closeAllConnections(): Promise<void> {
    const entries = [...clients.values()];
    clients.clear();
    await Promise.all(entries.map(({ sql }) => sql.end()));
}
