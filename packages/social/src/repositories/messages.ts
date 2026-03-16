import { eq, sql, desc, gt } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { messages, readReceipts, attachments } from "../schema.js";

export type MessageRow = typeof messages.$inferSelect;
export type ReadReceiptRow = typeof readReceipts.$inferSelect;
export type AttachmentRow = typeof attachments.$inferSelect;

export function createMessagesRepo(db: ScopedClient) {
    return {
        async create(data: {
            conversationId: string;
            senderId: string;
            body: string;
        }): Promise<MessageRow> {
            const rows = await db
                .insert(messages)
                .values({
                    conversationId: data.conversationId,
                    senderId: data.senderId,
                    body: data.body,
                })
                .returning();
            return rows[0]!;
        },

        async getThread(
            conversationId: string,
            page = 1,
            pageSize = 50,
        ): Promise<{ items: MessageRow[]; total: number; page: number; pageSize: number }> {
            const condition = eq(messages.conversationId, conversationId);

            const [countResult, items] = await Promise.all([
                db.select({ count: sql<number>`count(*)::int` }).from(messages).where(condition),
                db
                    .select()
                    .from(messages)
                    .where(condition)
                    .orderBy(desc(messages.createdAt))
                    .limit(pageSize)
                    .offset((page - 1) * pageSize),
            ]);

            return {
                items,
                total: countResult[0]?.count ?? 0,
                page,
                pageSize,
            };
        },

        async getSince(conversationId: string, since: Date): Promise<MessageRow[]> {
            return db
                .select()
                .from(messages)
                .where(
                    sql`${messages.conversationId} = ${conversationId} AND ${messages.createdAt} > ${since}`,
                )
                .orderBy(messages.createdAt);
        },

        async markRead(messageId: string, readerId: string): Promise<ReadReceiptRow> {
            const rows = await db
                .insert(readReceipts)
                .values({ messageId, readerId })
                .onConflictDoNothing()
                .returning();

            if (!rows[0]) {
                // Already read — fetch existing
                const existing = await db
                    .select()
                    .from(readReceipts)
                    .where(
                        sql`${readReceipts.messageId} = ${messageId} AND ${readReceipts.readerId} = ${readerId}`,
                    );
                return existing[0]!;
            }

            return rows[0];
        },

        async addAttachments(
            messageId: string,
            files: { fileUrl: string; fileName: string; fileSize?: number; mimeType?: string }[],
        ): Promise<AttachmentRow[]> {
            if (files.length === 0) return [];
            const rows = await db
                .insert(attachments)
                .values(
                    files.map((f) => ({
                        messageId,
                        fileUrl: f.fileUrl,
                        fileName: f.fileName,
                        fileSize: f.fileSize ?? null,
                        mimeType: f.mimeType ?? null,
                    })),
                )
                .returning();
            return rows;
        },

        async getAttachments(messageId: string): Promise<AttachmentRow[]> {
            return db
                .select()
                .from(attachments)
                .where(eq(attachments.messageId, messageId));
        },
    };
}
