import type { ScopedClient } from "@vvs/shared";
import { writeToOutbox } from "@vvs/shared";
import type { PlatformSettings, SettingsUpdateInput } from "@vvs/contracts";
import { createAdminRepo } from "../repositories/admin.js";
import { createModerationRepo } from "../repositories/moderation.js";

// In-memory cache with 60-second TTL
let settingsCache: { data: PlatformSettings; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

const DEFAULT_SETTINGS: PlatformSettings = {
    inviteLimitPerTier: { free: 3, verified: 10, pro: 50 },
    platformFeePercentage: 10,
    reputationThresholds: { low: 0, medium: 50, high: 80 },
    featureFlags: {},
    updatedAt: new Date(),
};

export async function getSetting(db: ScopedClient, key: string): Promise<unknown> {
    const repo = createAdminRepo(db);
    const row = await repo.getSetting(key);
    return row?.value ?? null;
}

export async function setSetting(
    db: ScopedClient,
    key: string,
    value: unknown,
    adminId: string,
): Promise<void> {
    const repo = createAdminRepo(db);
    const modRepo = createModerationRepo(db);

    await repo.upsertSetting(key, value, adminId);

    // Invalidate cache
    settingsCache = null;

    await modRepo.logAuditAction({
        adminUserId: adminId,
        action: "update_setting",
        targetType: "setting",
        targetId: key,
        details: { value },
    });

    await writeToOutbox(
        db,
        "platform.settings.updated",
        {
            settingKeys: [key],
            updatedBy: adminId,
            timestamp: new Date(),
        },
        `settings-updated-${key}-${Date.now()}`,
    );
}

export async function getSettings(db: ScopedClient): Promise<PlatformSettings> {
    // Check cache
    if (settingsCache && Date.now() < settingsCache.expiresAt) {
        return settingsCache.data;
    }

    const repo = createAdminRepo(db);
    const rows = await repo.getAllSettings();

    const settings = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
        switch (row.key) {
            case "inviteLimitPerTier":
                settings.inviteLimitPerTier = row.value as any;
                break;
            case "platformFeePercentage":
                settings.platformFeePercentage = row.value as number;
                break;
            case "reputationThresholds":
                settings.reputationThresholds = row.value as any;
                break;
            case "featureFlags":
                settings.featureFlags = row.value as any;
                break;
        }
        if (row.updatedAt > settings.updatedAt) {
            settings.updatedAt = row.updatedAt;
        }
    }

    settingsCache = { data: settings, expiresAt: Date.now() + CACHE_TTL_MS };
    return settings;
}

export async function updateSettings(
    db: ScopedClient,
    input: SettingsUpdateInput,
    adminId: string,
): Promise<PlatformSettings> {
    if (input.inviteLimitPerTier) await setSetting(db, "inviteLimitPerTier", input.inviteLimitPerTier, adminId);
    if (input.platformFeePercentage != null) await setSetting(db, "platformFeePercentage", input.platformFeePercentage, adminId);
    if (input.reputationThresholds) await setSetting(db, "reputationThresholds", input.reputationThresholds, adminId);
    if (input.featureFlags) await setSetting(db, "featureFlags", input.featureFlags, adminId);

    return getSettings(db);
}

/**
 * Clear settings cache (useful for testing).
 */
export function clearSettingsCache(): void {
    settingsCache = null;
}
