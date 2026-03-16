/** Shared Fastify JSON schema fragments */

export const paginationQuerySchema = {
    type: "object",
    properties: {
        page: { type: "integer", minimum: 1, default: 1 },
        pageSize: { type: "integer", minimum: 1, maximum: 100, default: 20 },
    },
} as const;

export const paginatedResponseSchema = {
    type: "object",
    properties: {
        items: { type: "array" },
        total: { type: "integer" },
        page: { type: "integer" },
        pageSize: { type: "integer" },
    },
    required: ["items", "total", "page", "pageSize"],
} as const;

export const moneySchema = {
    type: "object",
    properties: {
        amount: { type: "integer" },
        currency: { type: "string", enum: ["NGN"] },
    },
    required: ["amount", "currency"],
} as const;

export const errorResponseSchema = {
    type: "object",
    properties: {
        code: { type: "string" },
        message: { type: "string" },
        fields: {
            type: "object",
            additionalProperties: { type: "string" },
        },
    },
    required: ["code", "message"],
} as const;
