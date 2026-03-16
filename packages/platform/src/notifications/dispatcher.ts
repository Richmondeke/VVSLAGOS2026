import type { ScopedClient } from "@vvs/shared";
import { createNotificationsRepo, type NotificationRouteRow } from "../repositories/notifications.js";
import type { IEmailAdapter } from "./channels/email.js";
import type { IPushAdapter } from "./channels/push.js";
import type { ISmsAdapter } from "./channels/sms.js";
import type { IInAppAdapter } from "./channels/in-app.js";

const DEFAULT_MAX_PER_HOUR = 10;
const DEFAULT_WINDOW_SECONDS = 3600;

export type DispatcherDeps = {
    db: ScopedClient;
    email: IEmailAdapter;
    push: IPushAdapter;
    sms: ISmsAdapter;
    inApp: IInAppAdapter;
};

/**
 * Simple template rendering (replaces {{key}} with values).
 */
function renderTemplate(template: string, context: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_match, path: string) => {
        const value = path.split(".").reduce<unknown>((obj, key) => {
            if (obj && typeof obj === "object") return (obj as Record<string, unknown>)[key];
            return undefined;
        }, context);
        return value != null ? String(value) : "";
    });
}

/**
 * Extract a value from an object using a dot-separated path.
 */
function extractField(payload: Record<string, unknown>, path: string): string | undefined {
    const value = path.split(".").reduce<unknown>((obj, key) => {
        if (obj && typeof obj === "object") return (obj as Record<string, unknown>)[key];
        return undefined;
    }, payload);
    return value != null ? String(value) : undefined;
}

export function createNotificationDispatcher(deps: DispatcherDeps) {
    const { db, email, push, sms, inApp } = deps;

    return {
        /**
         * Process a domain event and dispatch notifications per configured routes.
         */
        async dispatch(eventType: string, payload: Record<string, unknown>): Promise<void> {
            const repo = createNotificationsRepo(db);

            // Find all routes for this event type
            const routes = await repo.getRoutesForEvent(eventType);
            if (routes.length === 0) return;

            for (const route of routes) {
                await this.processRoute(route, eventType, payload);
            }
        },

        async processRoute(
            route: NotificationRouteRow,
            eventType: string,
            payload: Record<string, unknown>,
        ): Promise<void> {
            const repo = createNotificationsRepo(db);

            // Extract recipient
            const recipientId = extractField(payload, route.recipientField);
            if (!recipientId) return;

            // Check rate limits
            const maxPerUser = route.maxPerUser ?? DEFAULT_MAX_PER_HOUR;
            const windowSeconds = route.maxPerUserWindow ?? DEFAULT_WINDOW_SECONDS;
            const recentCount = await repo.getRecentNotificationCount(recipientId, eventType, windowSeconds);

            if (recentCount >= maxPerUser) {
                await repo.logNotification({
                    userId: recipientId,
                    eventType,
                    channel: "all",
                    status: "rate_limited",
                    reference: `limit:${maxPerUser}/${windowSeconds}s`,
                });
                return;
            }

            // Check cooldown
            if (route.cooldownSeconds) {
                const lastTime = await repo.getLastNotificationTime(recipientId, eventType);
                if (lastTime) {
                    const elapsedSeconds = (Date.now() - lastTime.getTime()) / 1000;
                    if (elapsedSeconds < route.cooldownSeconds) {
                        await repo.logNotification({
                            userId: recipientId,
                            eventType,
                            channel: "all",
                            status: "rate_limited",
                            reference: `cooldown:${route.cooldownSeconds}s`,
                        });
                        return;
                    }
                }
            }

            // Check user preferences
            const prefs = await repo.getPreferences(recipientId);
            const userPrefs = prefs?.preferences as Record<string, Record<string, boolean>> | undefined;
            const eventPrefs = userPrefs?.[eventType] ?? {};

            // Load template
            const template = await repo.getTemplate(route.templateId);
            if (!template) {
                await repo.logNotification({
                    userId: recipientId,
                    eventType,
                    channel: "all",
                    status: "failed",
                    reference: `missing_template:${route.templateId}`,
                });
                return;
            }

            // Render template
            let renderedBody: string;
            let renderedSubject: string;
            try {
                renderedBody = renderTemplate(template.body, payload);
                renderedSubject = template.subject ? renderTemplate(template.subject, payload) : "";
            } catch {
                await repo.logNotification({
                    userId: recipientId,
                    eventType,
                    channel: "all",
                    status: "failed",
                    reference: `template_error:${route.templateId}`,
                });
                return;
            }

            // Dispatch to each channel
            const channels = route.channels ?? [];
            for (const channel of channels) {
                // Skip if user has disabled this channel
                if (eventPrefs[channel] === false) {
                    await repo.logNotification({
                        userId: recipientId,
                        eventType,
                        channel,
                        status: "skipped",
                        reference: "user_preference_disabled",
                    });
                    continue;
                }

                try {
                    await this.sendToChannel(channel, recipientId, renderedSubject, renderedBody, payload);
                    await repo.logNotification({
                        userId: recipientId,
                        eventType,
                        channel,
                        status: "sent",
                    });
                } catch (err) {
                    await repo.logNotification({
                        userId: recipientId,
                        eventType,
                        channel,
                        status: "failed",
                        reference: err instanceof Error ? err.message : "unknown_error",
                    });
                }
            }
        },

        async sendToChannel(
            channel: string,
            userId: string,
            subject: string,
            body: string,
            payload: Record<string, unknown>,
        ): Promise<void> {
            switch (channel) {
                case "email":
                    await email.sendEmail({ to: userId, subject, htmlBody: body });
                    break;
                case "push":
                    await push.sendPush({ expoPushToken: userId, title: subject, body });
                    break;
                case "sms":
                    await sms.sendSms({ to: userId, message: body });
                    break;
                case "in_app":
                    await inApp.deliver({ userId, title: subject, body });
                    break;
            }
        },
    };
}
