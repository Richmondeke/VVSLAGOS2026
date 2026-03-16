export interface IPushAdapter {
    sendPush(opts: { expoPushToken: string; title: string; body: string; data?: Record<string, unknown> }): Promise<void>;
}

export function createMockPushAdapter(): IPushAdapter & { calls: Array<{ title: string; body: string }> } {
    const calls: Array<{ title: string; body: string }> = [];
    return {
        calls,
        async sendPush(opts) {
            calls.push({ title: opts.title, body: opts.body });
        },
    };
}
