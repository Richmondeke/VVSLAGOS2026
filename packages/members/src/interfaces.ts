import type { ScopedClient } from "@vvs/shared";
import type {
    IProfileService,
    IPortfolioService,
    Profile,
    ProfileUpdateInput,
    ProfileSearchQuery,
    ProfileSummary,
    PortfolioItem,
    PortfolioItemInput,
    Paginated,
} from "@vvs/contracts";
import { createProfile, updateProfile, getProfile, searchProfiles } from "./profiles.js";
import { createItem, getItems } from "./portfolio.js";

export function createProfileService(db: ScopedClient): IProfileService {
    return {
        async create(userId: string): Promise<Profile> {
            return createProfile(db, userId);
        },

        async update(userId: string, input: ProfileUpdateInput): Promise<Profile> {
            return updateProfile(db, userId, input);
        },

        async get(userId: string): Promise<Profile> {
            return getProfile(db, userId);
        },

        async search(query: ProfileSearchQuery): Promise<Paginated<ProfileSummary>> {
            return searchProfiles(db, query);
        },
    };
}

export function createPortfolioService(db: ScopedClient): IPortfolioService {
    return {
        async createItem(userId: string, input: PortfolioItemInput): Promise<PortfolioItem> {
            return createItem(db, userId, input);
        },

        async getItems(userId: string, page: number): Promise<Paginated<PortfolioItem>> {
            return getItems(db, userId, page);
        },
    };
}
