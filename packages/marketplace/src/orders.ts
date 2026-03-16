import type { ScopedClient } from "@vvs/shared";
import { ValidationError } from "@vvs/shared";
import { createOrdersRepo } from "./repositories/orders.js";

// --- Order State Machine ---

// All valid order statuses
export type OrderState =
    | "draft"
    | "accepted"
    | "declined"
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
    | "resolved_partial"
    | "cancelled"
    | "refunded";

// Valid state transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
    draft: ["accepted", "declined", "cancelled"],
    accepted: ["pending_funding", "cancelled"],
    declined: [],
    pending_funding: ["funded", "cancelled"],
    funded: ["in_progress", "disputed", "cancelled"],
    in_progress: ["delivered", "disputed"],
    delivered: ["pending_approval", "disputed"],
    pending_approval: ["completed", "disputed"],
    completed: ["rated"],
    rated: [],
    disputed: ["resolved_released", "resolved_refunded", "resolved_partial"],
    resolved_released: [],
    resolved_refunded: [],
    resolved_partial: [],
    cancelled: ["refunded"],
    refunded: [],
};

export function isValidTransition(from: string, to: string): boolean {
    const allowed = VALID_TRANSITIONS[from];
    return allowed !== undefined && allowed.includes(to);
}

export function getValidTransitions(from: string): string[] {
    return VALID_TRANSITIONS[from] ?? [];
}

/**
 * Atomically transitions an order to a new status, logging the transition.
 * Throws ValidationError if the transition is invalid.
 */
export async function transitionOrder(
    db: ScopedClient,
    orderId: string,
    newStatus: OrderState,
    actorId?: string,
    reason?: string,
    metadata?: unknown,
): Promise<void> {
    const repo = createOrdersRepo(db);

    const order = await repo.findById(orderId);
    if (!order) {
        throw new ValidationError(`Order '${orderId}' not found`);
    }

    const currentStatus = order.status;

    if (!isValidTransition(currentStatus, newStatus)) {
        const validTargets = getValidTransitions(currentStatus);
        throw new ValidationError(
            `Invalid transition: cannot move from '${currentStatus}' to '${newStatus}'. ` +
            `Valid transitions from '${currentStatus}': [${validTargets.join(", ")}]`,
        );
    }

    // Update order status
    await repo.updateStatus(orderId, newStatus);

    // Log the transition
    await repo.logTransition({
        orderId,
        fromStatus: currentStatus,
        toStatus: newStatus,
        actorId,
        reason,
        metadata,
        correlationId: order.correlationId ?? undefined,
    });
}
