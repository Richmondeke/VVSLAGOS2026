import { and, eq, isNull } from "drizzle-orm";
import { sql } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { badges } from "./schema.js";

export type BadgeType = "verified" | "founding_member" | "pro";

export type BadgeRow = typeof badges.$inferSelect;

export async function issueBadge(
    db: ScopedClient,
    userId: string,
    badgeType: BadgeType,
    adminId?: string,
): Promise<BadgeRow> {
    const rows = await db
        .insert(badges)
        .values({
            userId,
            badgeType,
            issuedBy: adminId ?? null,
        })
        .returning();
    return rows[0]!;
}

export async function revokeBadge(
    db: ScopedClient,
    userId: string,
    badgeType: BadgeType,
): Promise<void> {
    await db
        .update(badges)
        .set({ revokedAt: sql`NOW()` })
        .where(
            and(
                eq(badges.userId, userId),
                eq(badges.badgeType, badgeType),
                isNull(badges.revokedAt),
            ),
        );
}

export async function getBadges(
    db: ScopedClient,
    userId: string,
): Promise<BadgeRow[]> {
    return db
        .select()
        .from(badges)
        .where(and(eq(badges.userId, userId), isNull(badges.revokedAt)));
}
