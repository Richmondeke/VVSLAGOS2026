import type { MemberTier, Paginated, VerificationStatus } from "./common.js";

// --- Types ---

export type Profile = {
    id: string;
    userId: string;
    bio: string;
    profession: string;
    category: string;
    skills: string[];
    availability: "available" | "unavailable" | "limited";
    location?: string;
    visibility: "public" | "private" | "verified_only";
    avatarUrl?: string;
    createdAt: Date;
    updatedAt: Date;
};

export type ProfileSummary = {
    id: string;
    userId: string;
    profession: string;
    category: string;
    skills: string[];
    avatarUrl?: string;
    tier: MemberTier;
    verificationStatus: VerificationStatus;
};

export type PortfolioItem = {
    id: string;
    userId: string;
    title: string;
    description: string;
    tags: string[];
    mediaUrls: string[];
    caseStudy?: CaseStudy;
    collaborators: string[];
    createdAt: Date;
    updatedAt: Date;
};

export type CaseStudy = {
    challenge: string;
    approach: string;
    outcome: string;
    metrics: Record<string, string | number>;
};

export type ProfileUpdateInput = {
    bio?: string;
    profession?: string;
    category?: string;
    skills?: string[];
    availability?: "available" | "unavailable" | "limited";
    location?: string;
    visibility?: "public" | "private" | "verified_only";
    avatarUrl?: string;
};

export type ProfileSearchQuery = {
    query?: string;
    category?: string;
    skills?: string[];
    availability?: "available" | "unavailable" | "limited";
    page: number;
    pageSize: number;
};

export type PortfolioItemInput = {
    title: string;
    description: string;
    tags: string[];
    mediaUrls: string[];
    caseStudy?: CaseStudy;
    collaborators?: string[];
};

// --- Interfaces ---

export interface IProfileService {
    create(userId: string): Promise<Profile>;
    update(userId: string, input: ProfileUpdateInput): Promise<Profile>;
    get(userId: string): Promise<Profile>;
    search(query: ProfileSearchQuery): Promise<Paginated<ProfileSummary>>;
}

export interface IPortfolioService {
    createItem(userId: string, input: PortfolioItemInput): Promise<PortfolioItem>;
    getItems(userId: string, page: number): Promise<Paginated<PortfolioItem>>;
}
