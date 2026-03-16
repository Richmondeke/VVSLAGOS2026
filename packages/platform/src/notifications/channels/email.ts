export interface IEmailAdapter {
    sendEmail(opts: { to: string; subject: string; htmlBody: string; textBody?: string }): Promise<void>;
}

/**
 * Mock email adapter for testing. Records all calls.
 */
export function createMockEmailAdapter(): IEmailAdapter & { calls: Array<{ to: string; subject: string }> } {
    const calls: Array<{ to: string; subject: string }> = [];
    return {
        calls,
        async sendEmail(opts) {
            calls.push({ to: opts.to, subject: opts.subject });
        },
    };
}
