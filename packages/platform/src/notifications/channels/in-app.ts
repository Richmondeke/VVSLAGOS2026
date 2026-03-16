export interface IInAppAdapter {
    deliver(opts: { userId: string; title: string; body: string; data?: Record<string, unknown> }): Promise<void>;
}

export function createMockInAppAdapter(): IInAppAdapter & { calls: Array<{ userId: string; title: string }> } {
    const calls: Array<{ userId: string; title: string }> = [];
    return {
        calls,
        async deliver(opts) {
            calls.push({ userId: opts.userId, title: opts.title });
        },
    };
}
