// Foundation types shared across all domains

export type Money = {
    amount: number; // in smallest currency unit (kobo for NGN)
    currency: "NGN";
};

export type Paginated<T> = {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
};

export type MemberTier = "free" | "verified" | "pro";

export type VerificationStatus = "pending" | "provisional" | "verified" | "rejected" | "expired";

export type OrderStatus =
    | "draft"
    | "pending_funding"
    | "funded"
    | "in_progress"
    | "delivered"
    | "pending_approval"
    | "completed"
    | "rated"
    | "disputed"
    | "resolved_released"
    | "resolved_refunded"
    | "cancelled"
    | "refunded";

export type EntryType = "credit" | "debit";

export type NotificationChannel = "push" | "email" | "sms" | "in_app";
