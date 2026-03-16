import type { ScopedClient } from "@vvs/shared";
import { NotFoundError, writeToOutbox } from "@vvs/shared";
import type { Profile, ProfileUpdateInput, ProfileSearchQuery, ProfileSummary, Paginated } from "@vvs/contracts";
import { createProfilesRepo, type ProfileRow } from "./repositories/profiles.js";

function mapRowToProfile(row: ProfileRow): Profile {
    return {
        id: row.id,
        userId: row.userId,
        bio: row.bio ?? "",
        profession: row.profession ?? "",
        category: "", // resolved via category lookup if needed
        skills: row.skills ?? [],
        availability: mapAvailability(row.availabilityStatus),
        location: [row.locationCity, row.locationCountry].filter(Boolean).join(", ") || undefined,
        visibility: row.isPublic ? "public" : "private",
        avatarUrl: row.profilePhotoUrl ?? undefined,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}

function mapAvailability(status: string): "available" | "unavailable" | "limited" {
    switch (status) {
        case "available":
            return "available";
        case "busy":
            return "limited";
        case "not_taking_work":
            return "unavailable";
        default:
            return "available";
    }
}

export async function createProfile(db: ScopedClient, userId: string): Promise<Profile> {
    const repo = createProfilesRepo(db);

    // Check if profile already exists
    const existing = await repo.findByUserId(userId);
    if (existing) return mapRowToProfile(existing);

    const row = await repo.create({ userId });

    await writeToOutbox(
        db,
        "members.profile.created",
        {
            userId,
            profileId: row.id,
            timestamp: new Date(),
        },
        `profile-created-${userId}`,
    );

    return mapRowToProfile(row);
}

export async function updateProfile(
    db: ScopedClient,
    userId: string,
    input: ProfileUpdateInput,
): Promise<Profile> {
    const repo = createProfilesRepo(db);

    // Map contract input to repo update fields
    const updateData: Record<string, unknown> = {};
    if (input.bio !== undefined) updateData.bio = input.bio;
    if (input.profession !== undefined) updateData.profession = input.profession;
    if (input.skills !== undefined) updateData.skills = input.skills;
    if (input.avatarUrl !== undefined) updateData.profilePhotoUrl = input.avatarUrl;
    if (input.location !== undefined) {
        // Simple city/country split on comma
        const parts = input.location.split(",").map((s) => s.trim());
        updateData.locationCity = parts[0] ?? null;
        updateData.locationCountry = parts[1] ?? null;
    }
    if (input.availability !== undefined) {
        const availMap: Record<string, string> = {
            available: "available",
            limited: "busy",
            unavailable: "not_taking_work",
        };
        updateData.availabilityStatus = availMap[input.availability] ?? "available";
    }
    if (input.visibility !== undefined) {
        updateData.isPublic = input.visibility === "public";
    }

    const row = await repo.update(userId, updateData);
    if (!row) throw new NotFoundError("Profile", userId);

    const changes = Object.keys(input).filter(
        (k) => input[k as keyof ProfileUpdateInput] !== undefined,
    );
    await writeToOutbox(
        db,
        "members.profile.updated",
        {
            userId,
            profileId: row.id,
            changes,
            timestamp: new Date(),
        },
        `profile-updated-${userId}-${Date.now()}`,
    );

    return mapRowToProfile(row);
}

export async function getProfile(db: ScopedClient, userId: string): Promise<Profile> {
    const repo = createProfilesRepo(db);
    const row = await repo.findByUserId(userId);
    if (!row) throw new NotFoundError("Profile", userId);
    return mapRowToProfile(row);
}

export async function getPublicProfile(db: ScopedClient, userId: string): Promise<Profile> {
    const repo = createProfilesRepo(db);
    const row = await repo.findPublicByUserId(userId);
    if (!row) throw new NotFoundError("Profile", userId);
    return mapRowToProfile(row);
}

export async function searchProfiles(
    db: ScopedClient,
    query: ProfileSearchQuery,
): Promise<Paginated<ProfileSummary>> {
    const repo = createProfilesRepo(db);
    const result = await repo.search({
        query: query.query,
        category: query.category,
        availability: query.availability,
        page: query.page,
        pageSize: query.pageSize,
    });

    return {
        items: result.items.map((row) => ({
            id: row.id,
            userId: row.userId,
            profession: row.profession ?? "",
            category: "",
            skills: row.skills ?? [],
            avatarUrl: row.profilePhotoUrl ?? undefined,
            tier: "free" as const,
            verificationStatus: "pending" as const,
        })),
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
    };
}
