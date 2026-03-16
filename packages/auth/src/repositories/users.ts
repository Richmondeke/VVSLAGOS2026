import { eq, sql, like, or, count, desc } from "drizzle-orm";
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

        async listUsers(opts: {
            page?: number;
            pageSize?: number;
            status?: string;
            search?: string;
        } = {}): Promise<{ items: UserRow[]; total: number; page: number; pageSize: number }> {
            const page = opts.page ?? 1;
            const pageSize = opts.pageSize ?? 20;
            const offset = (page - 1) * pageSize;

            const conditions = [];
            if (opts.status) {
                conditions.push(eq(users.status, opts.status as UserRow["status"]));
            }
            if (opts.search) {
                const pattern = `%${opts.search}%`;
                conditions.push(or(like(users.email, pattern)));
            }

            const where = conditions.length > 0
                ? conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions[1]}`
                : undefined;

            const [items, totalRows] = await Promise.all([
                where
                    ? db.select().from(users).where(where).orderBy(desc(users.createdAt)).limit(pageSize).offset(offset)
                    : db.select().from(users).orderBy(desc(users.createdAt)).limit(pageSize).offset(offset),
                where
                    ? db.select({ count: count() }).from(users).where(where)
                    : db.select({ count: count() }).from(users),
            ]);

            return { items, total: totalRows[0]?.count ?? 0, page, pageSize };
        },

        async countByStatus(): Promise<Record<string, number>> {
            const rows = await db
                .select({ status: users.status, count: count() })
                .from(users)
                .groupBy(users.status);
            const result: Record<string, number> = {};
            for (const row of rows) {
                result[row.status] = row.count;
            }
            return result;
        },
    };
}
