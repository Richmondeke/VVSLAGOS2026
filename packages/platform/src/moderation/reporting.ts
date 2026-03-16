import type { ScopedClient } from "@vvs/shared";
import { NotFoundError, ValidationError } from "@vvs/shared";
import type { Report, ReportInput } from "@vvs/contracts";
import { createModerationRepo, type ModerationReportRow } from "../repositories/moderation.js";

function mapReportRow(row: ModerationReportRow): Report {
    return {
        id: row.id,
        reporterId: row.reporterId,
        reportedUserId: row.targetType === "member" ? row.targetId : undefined,
        reportedContentId: row.targetType !== "member" ? row.targetId : undefined,
        category: row.category as Report["category"],
        description: row.description ?? "",
        status: row.status as Report["status"],
        createdAt: row.createdAt,
    };
}

export async function fileReport(
    db: ScopedClient,
    reporterId: string,
    input: ReportInput,
): Promise<Report> {
    const repo = createModerationRepo(db);

    const targetType = input.reportedUserId ? "member" : "post";
    const targetId = input.reportedUserId ?? input.reportedContentId;
    if (!targetId) throw new ValidationError("Must provide reportedUserId or reportedContentId");

    const report = await repo.createReport({
        reporterId,
        targetType,
        targetId,
        category: input.category,
        description: input.description,
    });

    return mapReportRow(report);
}

export async function assignReport(
    db: ScopedClient,
    reportId: string,
    adminId: string,
): Promise<Report> {
    const repo = createModerationRepo(db);
    const row = await repo.assignReport(reportId, adminId);
    if (!row) throw new NotFoundError("Report", reportId);
    return mapReportRow(row);
}

export async function resolveReport(
    db: ScopedClient,
    reportId: string,
    adminId: string,
    action: string,
    reason: string,
): Promise<Report> {
    const repo = createModerationRepo(db);

    const report = await repo.findReportById(reportId);
    if (!report) throw new NotFoundError("Report", reportId);

    const resolved = await repo.resolveReport(reportId, "resolved");
    if (!resolved) throw new NotFoundError("Report", reportId);

    // Log the action
    await repo.logAuditAction({
        adminUserId: adminId,
        action: `resolve_report:${action}`,
        targetType: "report",
        targetId: reportId,
        details: { reason, originalCategory: report.category },
    });

    return mapReportRow(resolved);
}

export async function getPendingReports(
    db: ScopedClient,
    page = 1,
    pageSize = 20,
): Promise<Report[]> {
    const repo = createModerationRepo(db);
    const rows = await repo.getPendingReports(page, pageSize);
    return rows.map(mapReportRow);
}
