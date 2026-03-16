import { migrate } from "drizzle-orm/postgres-js/migrator";
import type { ScopedClient } from "./client.js";

/**
 * Runs Drizzle migrations against a database client.
 * @param db - A scoped Drizzle client
 * @param migrationsFolder - Path to the folder containing migration SQL files
 */
export async function runMigrations(db: ScopedClient, migrationsFolder: string): Promise<void> {
    await migrate(db, { migrationsFolder });
}
