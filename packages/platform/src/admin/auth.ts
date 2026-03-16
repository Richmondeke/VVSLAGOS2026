import type { ScopedClient } from "@vvs/shared";
import { ForbiddenError } from "@vvs/shared";
import { createAdminRepo } from "../repositories/admin.js";

const ROLE_HIERARCHY: Record<string, number> = {
    support: 1,
    moderator: 2,
    super_admin: 3,
};

export async function getAdminRole(db: ScopedClient, userId: string): Promise<string | null> {
    const repo = createAdminRepo(db);
    const admin = await repo.getAdminByUserId(userId);
    if (!admin || !admin.isActive) return null;
    return admin.role;
}

export async function requireAdmin(db: ScopedClient, userId: string): Promise<string> {
    const role = await getAdminRole(db, userId);
    if (!role) throw new ForbiddenError("Admin access required");
    return role;
}

export async function requireRole(db: ScopedClient, userId: string, minRole: string): Promise<string> {
    const role = await requireAdmin(db, userId);
    const userLevel = ROLE_HIERARCHY[role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;

    if (userLevel < requiredLevel) {
        throw new ForbiddenError(`Requires ${minRole} role or higher`);
    }

    return role;
}
