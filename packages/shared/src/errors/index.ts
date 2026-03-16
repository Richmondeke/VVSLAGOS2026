export abstract class AppError extends Error {
    abstract readonly code: string;
    abstract readonly statusCode: number;

    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class NotFoundError extends AppError {
    readonly code = "NOT_FOUND";
    readonly statusCode = 404;

    constructor(
        public readonly entity: string,
        public readonly id?: string,
    ) {
        super(id ? `${entity} with id '${id}' not found` : `${entity} not found`);
    }
}

export class ForbiddenError extends AppError {
    readonly code = "FORBIDDEN";
    readonly statusCode = 403;

    constructor(message = "You do not have permission to perform this action") {
        super(message);
    }
}

export class ValidationError extends AppError {
    readonly code = "VALIDATION_ERROR";
    readonly statusCode = 400;

    constructor(
        message: string,
        public readonly fields?: Record<string, string>,
    ) {
        super(message);
    }
}

export class ConflictError extends AppError {
    readonly code = "CONFLICT";
    readonly statusCode = 409;
}

export class InsufficientFundsError extends AppError {
    readonly code = "INSUFFICIENT_FUNDS";
    readonly statusCode = 422;

    constructor(
        public readonly walletId: string,
        public readonly requiredAmount: number,
    ) {
        super(`Insufficient funds in wallet '${walletId}'. Required: ${requiredAmount}`);
    }
}

export class UnauthorizedError extends AppError {
    readonly code = "UNAUTHORIZED";
    readonly statusCode = 401;

    constructor(message = "Authentication required") {
        super(message);
    }
}

/**
 * Maps an AppError to an HTTP-compatible response shape for Fastify error handler.
 */
export function mapErrorToHttp(error: unknown): {
    statusCode: number;
    body: { code: string; message: string; fields?: Record<string, string> };
} {
    if (error instanceof AppError) {
        return {
            statusCode: error.statusCode,
            body: {
                code: error.code,
                message: error.message,
                ...(error instanceof ValidationError && error.fields
                    ? { fields: error.fields }
                    : {}),
            },
        };
    }

    return {
        statusCode: 500,
        body: {
            code: "INTERNAL_ERROR",
            message: "An unexpected error occurred",
        },
    };
}
