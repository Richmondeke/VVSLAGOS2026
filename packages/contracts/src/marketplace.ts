import type { MemberTier, OrderStatus, Paginated } from "./common.js";
import type { AggregateRating } from "./finance.js";

// --- Types ---

export type PricingTier = {
    id: string;
    listingId: string;
    name: "basic" | "standard" | "premium";
    price: number; // in kobo
    description: string;
};

export type Listing = {
    id: string;
    providerId: string;
    title: string;
    description: string;
    category: string;
    pricingModel: "fixed" | "hourly" | "project";
    deliverables: string[];
    timeline?: string;
    tiers: PricingTier[];
    status: "draft" | "published" | "archived";
    createdAt: Date;
    updatedAt: Date;
};

export type ListingSummary = {
    id: string;
    providerId: string;
    title: string;
    category: string;
    pricingModel: "fixed" | "hourly" | "project";
    minPrice?: number;
    providerTier: MemberTier;
    createdAt: Date;
};

export type ListingWithRating = Listing & {
    aggregateRating: AggregateRating;
};

export type Milestone = {
    id: string;
    orderId: string;
    description: string;
    amount: number; // in kobo
    dueDate: Date;
    status: "pending" | "submitted" | "approved" | "released";
};

export type Order = {
    id: string;
    listingId: string;
    clientId: string;
    providerId: string;
    selectedTier: PricingTier;
    totalAmount: number; // in kobo
    status: OrderStatus;
    escrowId?: string;
    milestones: Milestone[];
    createdAt: Date;
    updatedAt: Date;
};

export type ListingCreateInput = {
    title: string;
    description: string;
    category: string;
    pricingModel: "fixed" | "hourly" | "project";
    deliverables: string[];
    timeline?: string;
    tiers: { name: "basic" | "standard" | "premium"; price: number; description: string }[];
};

export type ListingSearchQuery = {
    query?: string;
    category?: string;
    pricingModel?: "fixed" | "hourly" | "project";
    page: number;
    pageSize: number;
};

export type OrderCreateInput = {
    listingId: string;
    clientId: string;
    selectedTierId: string;
    milestones: { description: string; amount: number; dueDate: Date }[];
};

export type DeliverableInput = {
    milestoneId: string;
    description: string;
    attachmentUrls: string[];
};

// --- Interfaces ---

export interface IListingService {
    create(userId: string, input: ListingCreateInput): Promise<Listing>;
    search(query: ListingSearchQuery): Promise<Paginated<ListingSummary>>;
    getWithRating(listingId: string): Promise<ListingWithRating>;
}

export interface IOrderService {
    create(input: OrderCreateInput): Promise<Order>;
    fund(orderId: string): Promise<void>;
    submitDeliverable(orderId: string, input: DeliverableInput): Promise<void>;
    approveMilestone(orderId: string, milestoneId: string): Promise<void>;
    dispute(orderId: string, reason: string): Promise<void>;
    status(orderId: string): Promise<OrderStatus>;
}
