import { describe, expect, it } from "vitest";
import {
    ConflictError,
    ForbiddenError,
    InsufficientFundsError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
    mapErrorToHttp,
} from "../../src/errors/index.js";

describe("Error types", () => {
    it("NotFoundError has statusCode 404", () => {
        const error = new NotFoundError("User", "abc-123");
        expect(error.statusCode).toBe(404);
        expect(error.code).toBe("NOT_FOUND");
        expect(error.message).toContain("abc-123");
    });

    it("ForbiddenError has statusCode 403", () => {
        const error = new ForbiddenError();
        expect(error.statusCode).toBe(403);
        expect(error.code).toBe("FORBIDDEN");
    });

    it("ValidationError has statusCode 400 with field details", () => {
        const error = new ValidationError("Invalid input", { email: "required" });
        expect(error.statusCode).toBe(400);
        expect(error.code).toBe("VALIDATION_ERROR");
        expect(error.fields).toEqual({ email: "required" });
    });

    it("ConflictError has statusCode 409", () => {
        const error = new ConflictError("Already exists");
        expect(error.statusCode).toBe(409);
        expect(error.code).toBe("CONFLICT");
    });

    it("InsufficientFundsError has statusCode 422", () => {
        const error = new InsufficientFundsError("wallet-1", 50000);
        expect(error.statusCode).toBe(422);
        expect(error.code).toBe("INSUFFICIENT_FUNDS");
        expect(error.walletId).toBe("wallet-1");
        expect(error.requiredAmount).toBe(50000);
    });

    it("UnauthorizedError has statusCode 401", () => {
        const error = new UnauthorizedError();
        expect(error.statusCode).toBe(401);
        expect(error.code).toBe("UNAUTHORIZED");
    });
});

describe("mapErrorToHttp", () => {
    it("maps AppError to correct HTTP response", () => {
        const error = new ValidationError("Bad input", { name: "too short" });
        const result = mapErrorToHttp(error);
        expect(result.statusCode).toBe(400);
        expect(result.body.code).toBe("VALIDATION_ERROR");
        expect(result.body.fields).toEqual({ name: "too short" });
    });

    it("maps unknown errors to 500", () => {
        const result = mapErrorToHttp(new Error("random"));
        expect(result.statusCode).toBe(500);
        expect(result.body.code).toBe("INTERNAL_ERROR");
    });
});
