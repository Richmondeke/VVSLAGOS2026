import { createHmac } from "node:crypto";

// --- Types ---

export type InitializePaymentInput = {
    email: string;
    amount: number; // in kobo
    reference: string;
    callbackUrl?: string;
};

export type InitializePaymentResult = {
    authorizationUrl: string;
    accessCode: string;
    reference: string;
};

export type VerifyPaymentResult = {
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number;
    paidAt?: string;
    channel?: string;
};

export type InitiateTransferInput = {
    amount: number; // in kobo
    bankCode: string;
    accountNumber: string;
    reference: string;
    reason?: string;
};

export type InitiateTransferResult = {
    transferCode: string;
    reference: string;
    status: string;
};

export type VerifyTransferResult = {
    status: "success" | "failed" | "pending" | "reversed";
    transferCode: string;
    reference: string;
    amount: number;
};

// --- Interface ---

export interface IPaystackGateway {
    initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResult>;
    verifyPayment(reference: string): Promise<VerifyPaymentResult>;
    verifyWebhookSignature(payload: string, signature: string): boolean;
    initiateTransfer(input: InitiateTransferInput): Promise<InitiateTransferResult>;
    verifyTransfer(transferCode: string): Promise<VerifyTransferResult>;
}

// --- Live Implementation ---

export function createPaystackGateway(secretKey: string): IPaystackGateway {
    const baseUrl = "https://api.paystack.co";

    async function paystackRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
        const res = await fetch(`${baseUrl}${path}`, {
            method,
            headers: {
                Authorization: `Bearer ${secretKey}`,
                "Content-Type": "application/json",
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        const json = (await res.json()) as { status: boolean; message: string; data: T };
        if (!json.status) {
            throw new Error(`Paystack error: ${json.message}`);
        }
        return json.data;
    }

    return {
        async initializePayment(input) {
            const data = await paystackRequest<{
                authorization_url: string;
                access_code: string;
                reference: string;
            }>("POST", "/transaction/initialize", {
                email: input.email,
                amount: input.amount,
                reference: input.reference,
                callback_url: input.callbackUrl,
            });

            return {
                authorizationUrl: data.authorization_url,
                accessCode: data.access_code,
                reference: data.reference,
            };
        },

        async verifyPayment(reference) {
            const data = await paystackRequest<{
                status: string;
                reference: string;
                amount: number;
                paid_at?: string;
                channel?: string;
            }>("GET", `/transaction/verify/${encodeURIComponent(reference)}`);

            return {
                status: data.status as VerifyPaymentResult["status"],
                reference: data.reference,
                amount: data.amount,
                paidAt: data.paid_at,
                channel: data.channel,
            };
        },

        verifyWebhookSignature(payload, signature) {
            const hash = createHmac("sha512", secretKey).update(payload).digest("hex");
            return hash === signature;
        },

        async initiateTransfer(input) {
            const data = await paystackRequest<{
                transfer_code: string;
                reference: string;
                status: string;
            }>("POST", "/transfer", {
                source: "balance",
                amount: input.amount,
                recipient: input.accountNumber,
                bank_code: input.bankCode,
                reference: input.reference,
                reason: input.reason,
            });

            return {
                transferCode: data.transfer_code,
                reference: data.reference,
                status: data.status,
            };
        },

        async verifyTransfer(transferCode) {
            const data = await paystackRequest<{
                status: string;
                transfer_code: string;
                reference: string;
                amount: number;
            }>("GET", `/transfer/verify/${encodeURIComponent(transferCode)}`);

            return {
                status: data.status as VerifyTransferResult["status"],
                transferCode: data.transfer_code,
                reference: data.reference,
                amount: data.amount,
            };
        },
    };
}

// --- Mock for tests ---

export function createMockPaystackGateway(
    overrides?: Partial<IPaystackGateway>,
): IPaystackGateway {
    return {
        async initializePayment(input) {
            return {
                authorizationUrl: `https://checkout.paystack.com/mock/${input.reference}`,
                accessCode: `access_${input.reference}`,
                reference: input.reference,
            };
        },

        async verifyPayment(reference) {
            return {
                status: "success",
                reference,
                amount: 100000,
                paidAt: new Date().toISOString(),
                channel: "card",
            };
        },

        verifyWebhookSignature(_payload, _signature) {
            return true;
        },

        async initiateTransfer(input) {
            return {
                transferCode: `TRF_mock_${input.reference}`,
                reference: input.reference,
                status: "success",
            };
        },

        async verifyTransfer(transferCode) {
            return {
                status: "success",
                transferCode,
                reference: `ref_${transferCode}`,
                amount: 100000,
            };
        },

        ...overrides,
    };
}
