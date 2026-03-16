import { eq } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { kycDocuments } from "../schema.js";

export type NewKycDocument = {
    userId: string;
    docType: "NIN" | "drivers_license" | "passport" | "voters_card";
    frontUrl: string;
    backUrl?: string;
};

export type KycDocumentRow = typeof kycDocuments.$inferSelect;

export function createKycDocumentsRepo(db: ScopedClient) {
    return {
        async create(data: NewKycDocument): Promise<KycDocumentRow> {
            const rows = await db
                .insert(kycDocuments)
                .values({
                    userId: data.userId,
                    docType: data.docType,
                    frontUrl: data.frontUrl,
                    backUrl: data.backUrl ?? null,
                })
                .returning();
            return rows[0]!;
        },

        async findByUserId(userId: string): Promise<KycDocumentRow[]> {
            return db.select().from(kycDocuments).where(eq(kycDocuments.userId, userId));
        },
    };
}
