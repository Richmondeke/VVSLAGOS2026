import { eq, sql, and } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import type { Paginated } from "@vvs/contracts";
import { portfolioItems, portfolioMedia, caseStudies, collaborators } from "../schema.js";

export type PortfolioItemRow = typeof portfolioItems.$inferSelect;
export type PortfolioMediaRow = typeof portfolioMedia.$inferSelect;
export type CaseStudyRow = typeof caseStudies.$inferSelect;
export type CollaboratorRow = typeof collaborators.$inferSelect;

export type NewPortfolioItem = {
    userId: string;
    title: string;
    description?: string;
    tags?: string[];
};

export type NewPortfolioMedia = {
    portfolioItemId: string;
    url: string;
    thumbnailUrl?: string;
    mediaType: "image" | "video";
    displayOrder?: number;
};

export type NewCaseStudy = {
    portfolioItemId?: string;
    userId: string;
    challenge?: string;
    approach?: string;
    outcome?: string;
    metrics?: string;
};

export function createPortfolioItemsRepo(db: ScopedClient) {
    return {
        async createItem(data: NewPortfolioItem): Promise<PortfolioItemRow> {
            const rows = await db
                .insert(portfolioItems)
                .values({
                    userId: data.userId,
                    title: data.title,
                    description: data.description ?? null,
                    tags: data.tags ?? null,
                })
                .returning();
            return rows[0]!;
        },

        async findById(id: string): Promise<PortfolioItemRow | undefined> {
            const rows = await db
                .select()
                .from(portfolioItems)
                .where(eq(portfolioItems.id, id));
            return rows[0];
        },

        async findByUserId(userId: string, page: number, pageSize = 20): Promise<Paginated<PortfolioItemRow>> {
            const offset = (page - 1) * pageSize;

            const countResult = await db
                .select({ count: sql<number>`count(*)::int` })
                .from(portfolioItems)
                .where(eq(portfolioItems.userId, userId));

            const rows = await db
                .select()
                .from(portfolioItems)
                .where(eq(portfolioItems.userId, userId))
                .orderBy(portfolioItems.createdAt)
                .limit(pageSize)
                .offset(offset);

            return {
                items: rows,
                total: countResult[0]?.count ?? 0,
                page,
                pageSize,
            };
        },

        async publish(id: string, userId: string): Promise<PortfolioItemRow | undefined> {
            const rows = await db
                .update(portfolioItems)
                .set({ isPublished: true, updatedAt: sql`NOW()` })
                .where(and(eq(portfolioItems.id, id), eq(portfolioItems.userId, userId)))
                .returning();
            return rows[0];
        },

        async unpublish(id: string, userId: string): Promise<PortfolioItemRow | undefined> {
            const rows = await db
                .update(portfolioItems)
                .set({ isPublished: false, updatedAt: sql`NOW()` })
                .where(and(eq(portfolioItems.id, id), eq(portfolioItems.userId, userId)))
                .returning();
            return rows[0];
        },

        async softDelete(id: string, userId: string): Promise<PortfolioItemRow | undefined> {
            // Soft-delete by unpublishing and marking title
            const rows = await db
                .update(portfolioItems)
                .set({ isPublished: false, updatedAt: sql`NOW()` })
                .where(and(eq(portfolioItems.id, id), eq(portfolioItems.userId, userId)))
                .returning();
            return rows[0];
        },

        // --- Media ---

        async addMedia(data: NewPortfolioMedia): Promise<PortfolioMediaRow> {
            const rows = await db
                .insert(portfolioMedia)
                .values({
                    portfolioItemId: data.portfolioItemId,
                    url: data.url,
                    thumbnailUrl: data.thumbnailUrl ?? null,
                    mediaType: data.mediaType,
                    displayOrder: data.displayOrder ?? 0,
                })
                .returning();
            return rows[0]!;
        },

        async getMedia(portfolioItemId: string): Promise<PortfolioMediaRow[]> {
            return db
                .select()
                .from(portfolioMedia)
                .where(eq(portfolioMedia.portfolioItemId, portfolioItemId))
                .orderBy(portfolioMedia.displayOrder);
        },

        // --- Case Studies ---

        async createCaseStudy(data: NewCaseStudy): Promise<CaseStudyRow> {
            const rows = await db
                .insert(caseStudies)
                .values({
                    portfolioItemId: data.portfolioItemId ?? null,
                    userId: data.userId,
                    challenge: data.challenge ?? null,
                    approach: data.approach ?? null,
                    outcome: data.outcome ?? null,
                    metrics: data.metrics ?? null,
                })
                .returning();
            return rows[0]!;
        },

        async getCaseStudy(portfolioItemId: string): Promise<CaseStudyRow | undefined> {
            const rows = await db
                .select()
                .from(caseStudies)
                .where(eq(caseStudies.portfolioItemId, portfolioItemId));
            return rows[0];
        },

        // --- Collaborators ---

        async addCollaborator(portfolioItemId: string, collaboratorUserId: string): Promise<CollaboratorRow> {
            const rows = await db
                .insert(collaborators)
                .values({ portfolioItemId, collaboratorUserId })
                .returning();
            return rows[0]!;
        },

        async getCollaborators(portfolioItemId: string): Promise<CollaboratorRow[]> {
            return db
                .select()
                .from(collaborators)
                .where(eq(collaborators.portfolioItemId, portfolioItemId));
        },
    };
}
