import type { ScopedClient } from "@vvs/shared";
import { ForbiddenError, NotFoundError, writeToOutbox } from "@vvs/shared";
import { createModerationRepo } from "../repositories/moderation.js";

export async function warnUser(
    db: ScopedClient,
    userId: string,
    adminId: string,
    reason: string,
): Promise<void> {
    const repo = createModerationRepo(db);

    await repo.createAction({
        targetUserId: userId,
        actionType: "warn",
        reason,
        adminId,
    });

    await repo.logAuditAction({
        adminUserId: adminId,
        action: "warn_user",
        targetType: "user",
        targetId: userId,
        details: { reason },
    });
}

export async function suspendUser(
    db: ScopedClient,
    userId: string,
    adminId: string,
    reason: string,
    durationDays?: number,
): Promise<void> {
    const repo = createModerationRepo(db);

    await repo.createAction({
        targetUserId: userId,
        actionType: "suspend",
        duration: durationDays,
        reason,
        adminId,
    });

    await repo.logAuditAction({
        adminUserId: adminId,
        action: "suspend_user",
        targetType: "user",
        targetId: userId,
        details: { reason, durationDays },
    });

    await writeToOutbox(
        db,
        "platform.user.suspended",
        {
            userId,
            reason,
            timestamp: new Date(),
        },
        `user-suspended-${userId}-${Date.now()}`,
    );
}

export async function banUser(
    db: ScopedClient,
    userId: string,
    adminId: string,
    reason: string,
): Promise<void> {
    const repo = createModerationRepo(db);

    await repo.createAction({
        targetUserId: userId,
        actionType: "ban",
        reason,
        adminId,
    });

    await repo.createBan({ userId, reason, adminId });

    await repo.logAuditAction({
        adminUserId: adminId,
        action: "ban_user",
        targetType: "user",
        targetId: userId,
        details: { reason },
    });

    await writeToOutbox(
        db,
        "platform.user.banned",
        {
            userId,
            reason,
            timestamp: new Date(),
        },
        `user-banned-${userId}-${Date.now()}`,
    );
}

export async function reinstateUser(
    db: ScopedClient,
    userId: string,
    adminId: string,
    reason: string,
): Promise<void> {
    const repo = createModerationRepo(db);

    await repo.resolveBan(userId);

    await repo.logAuditAction({
        adminUserId: adminId,
        action: "reinstate_user",
        targetType: "user",
        targetId: userId,
        details: { reason },
    });
}

export async function handleAppeal(
    db: ScopedClient,
    appealId: string,
    reviewerAdminId: string,
    outcome: string,
    reason: string,
): Promise<void> {
    const repo = createModerationRepo(db);

    const appeal = await repo.findAppealById(appealId);
    if (!appeal) throw new NotFoundError("Appeal", appealId);

    // Get the original action to check admin
    const action = await repo.findActionById(appeal.moderationActionId);
    if (action && action.adminId === reviewerAdminId) {
        throw new ForbiddenError("Appeal reviewer must be a different admin than the one who took the original action");
    }

    await repo.resolveAppeal(appealId, reviewerAdminId, outcome);

    await repo.logAuditAction({
        adminUserId: reviewerAdminId,
        action: `resolve_appeal:${outcome}`,
        targetType: "appeal",
        targetId: appealId,
        details: { reason, outcome },
    });
}
