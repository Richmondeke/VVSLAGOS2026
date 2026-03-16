import type { ScopedClient } from "@vvs/shared";
import { NotFoundError, writeToOutbox } from "@vvs/shared";
import type { PortfolioItem, PortfolioItemInput, CaseStudy, Paginated } from "@vvs/contracts";
import { createPortfolioItemsRepo, type PortfolioItemRow, type PortfolioMediaRow, type CaseStudyRow, type CollaboratorRow } from "./repositories/portfolio-items.js";

function mapRowToPortfolioItem(
    row: PortfolioItemRow,
    media: PortfolioMediaRow[],
    caseStudy: CaseStudyRow | undefined,
    collabs: CollaboratorRow[],
): PortfolioItem {
    return {
        id: row.id,
        userId: row.userId,
        title: row.title,
        description: row.description ?? "",
        tags: row.tags ?? [],
        mediaUrls: media.map((m) => m.url),
        caseStudy: caseStudy
            ? {
                  challenge: caseStudy.challenge ?? "",
                  approach: caseStudy.approach ?? "",
                  outcome: caseStudy.outcome ?? "",
                  metrics: caseStudy.metrics ? JSON.parse(caseStudy.metrics) : {},
              }
            : undefined,
        collaborators: collabs.map((c) => c.collaboratorUserId),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}

export async function createItem(
    db: ScopedClient,
    userId: string,
    input: PortfolioItemInput,
): Promise<PortfolioItem> {
    const repo = createPortfolioItemsRepo(db);

    const item = await repo.createItem({
        userId,
        title: input.title,
        description: input.description,
        tags: input.tags,
    });

    // Add media
    for (const url of input.mediaUrls) {
        const mediaType = url.match(/\.(mp4|webm|mov|avi)$/i) ? "video" : "image";
        await repo.addMedia({
            portfolioItemId: item.id,
            url,
            mediaType: mediaType as "image" | "video",
        });
    }

    // Add case study if provided
    let caseStudyRow: CaseStudyRow | undefined;
    if (input.caseStudy) {
        caseStudyRow = await repo.createCaseStudy({
            portfolioItemId: item.id,
            userId,
            challenge: input.caseStudy.challenge,
            approach: input.caseStudy.approach,
            outcome: input.caseStudy.outcome,
            metrics: JSON.stringify(input.caseStudy.metrics),
        });
    }

    // Add collaborators
    const collabs: CollaboratorRow[] = [];
    if (input.collaborators) {
        for (const collaboratorUserId of input.collaborators) {
            const collab = await repo.addCollaborator(item.id, collaboratorUserId);
            collabs.push(collab);
        }
    }

    const media = await repo.getMedia(item.id);
    return mapRowToPortfolioItem(item, media, caseStudyRow, collabs);
}

export async function publishItem(
    db: ScopedClient,
    itemId: string,
    userId: string,
): Promise<PortfolioItem> {
    const repo = createPortfolioItemsRepo(db);

    const row = await repo.publish(itemId, userId);
    if (!row) throw new NotFoundError("PortfolioItem", itemId);

    await writeToOutbox(
        db,
        "members.portfolio.published",
        {
            userId,
            portfolioItemId: row.id,
            itemType: "project" as const,
            timestamp: new Date(),
        },
        `portfolio-published-${row.id}`,
    );

    const media = await repo.getMedia(row.id);
    const caseStudy = await repo.getCaseStudy(row.id);
    const collabs = await repo.getCollaborators(row.id);
    return mapRowToPortfolioItem(row, media, caseStudy, collabs);
}

export async function unpublishItem(
    db: ScopedClient,
    itemId: string,
    userId: string,
): Promise<PortfolioItem> {
    const repo = createPortfolioItemsRepo(db);

    const row = await repo.unpublish(itemId, userId);
    if (!row) throw new NotFoundError("PortfolioItem", itemId);

    const media = await repo.getMedia(row.id);
    const caseStudy = await repo.getCaseStudy(row.id);
    const collabs = await repo.getCollaborators(row.id);
    return mapRowToPortfolioItem(row, media, caseStudy, collabs);
}

export async function getItems(
    db: ScopedClient,
    userId: string,
    page: number,
): Promise<Paginated<PortfolioItem>> {
    const repo = createPortfolioItemsRepo(db);
    const result = await repo.findByUserId(userId, page);

    const items: PortfolioItem[] = [];
    for (const row of result.items) {
        const media = await repo.getMedia(row.id);
        const caseStudy = await repo.getCaseStudy(row.id);
        const collabs = await repo.getCollaborators(row.id);
        items.push(mapRowToPortfolioItem(row, media, caseStudy, collabs));
    }

    return {
        items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
    };
}

export async function deleteItem(
    db: ScopedClient,
    itemId: string,
    userId: string,
): Promise<void> {
    const repo = createPortfolioItemsRepo(db);
    const row = await repo.softDelete(itemId, userId);
    if (!row) throw new NotFoundError("PortfolioItem", itemId);
}
