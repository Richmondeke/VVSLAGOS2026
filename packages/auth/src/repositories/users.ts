import { eq, sql } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { users } from "../schema.js";

export type NewUser = {
    email: string;
    phone?: string;
    passwordHash: string;
};

export type UserRow = typeof users.$inferSelect;

export function createUsersRepo(db: ScopedClient) {
    return {
        async findById(id: string): Promise<UserRow | undefined> {
            const rows = await db.select().from(users).where(eq(users.id, id));
            return rows[0];
        },

        async findByEmail(email: string): Promise<UserRow | undefined> {
            const rows = await db.select().from(users).where(eq(users.email, email));
            return rows[0];
        },

        async findByPhone(phone: string): Promise<UserRow | undefined> {
            const rows = await db.select().from(users).where(eq(users.phone, phone));
            return rows[0];
        },

        async create(data: NewUser): Promise<UserRow> {
            const rows = await db
                .insert(users)
                .values({
                    email: data.email,
                    phone: data.phone ?? null,
                    passwordHash: data.passwordHash,
                })
                .returning();
            return rows[0]!;
        },

        async updateStatus(id: string, status: UserRow["status"]): Promise<UserRow | undefined> {
            const rows = await db
                .update(users)
                .set({ status, updatedAt: sql`NOW()` })
                .where(eq(users.id, id))
                .returning();
            return rows[0];
        },

        async updatePassword(id: string, passwordHash: string): Promise<void> {
            await db
                .update(users)
                .set({ passwordHash, updatedAt: sql`NOW()` })
                .where(eq(users.id, id));
        },
    };
}
