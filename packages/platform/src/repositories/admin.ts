import { eq, sql } from "@vvs/shared";
import type { ScopedClient } from "@vvs/shared";
import { adminUsers, platformSettings } from "../schema.js";

export type AdminUserRow = typeof adminUsers.$inferSelect;
export type PlatformSettingRow = typeof platformSettings.$inferSelect;

export function createAdminRepo(db: ScopedClient) {
    return {
        // --- Admin Users ---

        async getAdminByUserId(userId: string): Promise<AdminUserRow | undefined> {
            const rows = await db
                .select()
                .from(adminUsers)
                .where(eq(adminUsers.userId, userId));
            return rows[0];
        },

        async createAdmin(data: {
            userId: string;
            role: string;
        }): Promise<AdminUserRow> {
            const rows = await db
                .insert(adminUsers)
                .values({ userId: data.userId, role: data.role })
                .returning();
            return rows[0]!;
        },

        async listAdmins(): Promise<AdminUserRow[]> {
            return db.select().from(adminUsers);
        },

        async removeAdmin(userId: string): Promise<void> {
            await db.delete(adminUsers).where(eq(adminUsers.userId, userId));
        },

        // --- Platform Settings ---

        async getSetting(key: string): Promise<PlatformSettingRow | undefined> {
            const rows = await db
                .select()
                .from(platformSettings)
                .where(eq(platformSettings.key, key));
            return rows[0];
        },

        async getAllSettings(): Promise<PlatformSettingRow[]> {
            return db.select().from(platformSettings);
        },

        async upsertSetting(key: string, value: unknown, adminId: string): Promise<PlatformSettingRow> {
            const rows = await db
                .insert(platformSettings)
                .values({ key, value, updatedBy: adminId })
                .onConflictDoUpdate({
                    target: platformSettings.key,
                    set: { value, updatedBy: adminId, updatedAt: sql`NOW()` },
                })
                .returning();
            return rows[0]!;
        },
    };
}
