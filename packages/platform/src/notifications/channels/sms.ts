export interface ISmsAdapter {
    sendSms(opts: { to: string; message: string }): Promise<void>;
}

export function createMockSmsAdapter(): ISmsAdapter & { calls: Array<{ to: string; message: string }> } {
    const calls: Array<{ to: string; message: string }> = [];
    return {
        calls,
        async sendSms(opts) {
            calls.push({ to: opts.to, message: opts.message });
        },
    };
}
