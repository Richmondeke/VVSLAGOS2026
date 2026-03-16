import type { FastifyPluginAsync } from "fastify";
import type { ScopedClient } from "@vvs/shared";
import type { IPaystackGateway } from "./gateway.js";
import { initiateFunding, handlePaystackWebhook } from "./funding.js";
import { requestWithdrawal } from "./withdrawals.js";
import { createWalletsRepo } from "./repositories/wallets.js";
import { createLedgerRepo } from "./repositories/ledger.js";

export type FinanceRoutesOpts = {
    db: ScopedClient;
    gateway: IPaystackGateway;
};

export const financeRoutes: FastifyPluginAsync<FinanceRoutesOpts> = async (app, opts) => {
    const { db, gateway } = opts;

    // POST /finance/fund — initiates Paystack checkout
    app.post<{
        Body: { amount: number; email: string; callbackUrl?: string };
    }>(
        "/finance/fund",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["amount", "email"],
                    properties: {
                        amount: { type: "integer", minimum: 100 },
                        email: { type: "string", format: "email" },
                        callbackUrl: { type: "string" },
                    },
                },
            },
        },
        async (request, reply) => {
            // userId comes from auth middleware (not implemented here yet)
            const userId = (request as unknown as { userId: string }).userId;
            const result = await initiateFunding(
                db,
                gateway,
                userId,
                request.body.amount,
                request.body.email,
                request.body.callbackUrl,
            );
            return reply.send(result);
        },
    );

    // POST /finance/webhooks/paystack — no auth, verified by signature
    app.post(
        "/finance/webhooks/paystack",
        { config: { rawBody: true } },
        async (request, reply) => {
            const signature = request.headers["x-paystack-signature"] as string;
            const rawBody = typeof request.body === "string"
                ? request.body
                : JSON.stringify(request.body);

            await handlePaystackWebhook(db, gateway, rawBody, signature);
            return reply.status(200).send({ status: "ok" });
        },
    );

    // POST /finance/withdraw — auth required
    app.post<{
        Body: { amount: number; bankDetails: { accountNumber: string; accountName: string; bankCode: string } };
    }>(
        "/finance/withdraw",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["amount", "bankDetails"],
                    properties: {
                        amount: { type: "integer", minimum: 100 },
                        bankDetails: {
                            type: "object",
                            required: ["accountNumber", "accountName", "bankCode"],
                            properties: {
                                accountNumber: { type: "string" },
                                accountName: { type: "string" },
                                bankCode: { type: "string" },
                            },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            const userId = (request as unknown as { userId: string }).userId;
            const result = await requestWithdrawal(
                db,
                userId,
                request.body.amount,
                request.body.bankDetails,
            );
            return reply.status(201).send(result);
        },
    );

    // GET /finance/wallet — auth required, returns balance + history
    app.get<{
        Querystring: { page?: number };
    }>(
        "/finance/wallet",
        async (request, reply) => {
            const userId = (request as unknown as { userId: string }).userId;
            const walletsRepo = createWalletsRepo(db);
            const wallet = await walletsRepo.findByUserId(userId);

            const ledgerRepo = createLedgerRepo(db);
            const page = request.query.page ?? 1;
            const history = await ledgerRepo.getEntriesForWallet(wallet.id, page);

            return reply.send({
                wallet: {
                    id: wallet.id,
                    availableBalance: wallet.availableBalance,
                    lockedBalance: wallet.lockedBalance,
                    currency: wallet.currency,
                },
                history,
            });
        },
    );
};
