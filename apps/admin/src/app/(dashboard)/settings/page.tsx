"use client";

import { useEffect, useState } from "react";
import { apiClient, ApiError } from "@/lib/api-client";

type PlatformSettings = {
    inviteLimitPerTier: { free: number; verified: number; pro: number };
    platformFeePercentage: number;
    reputationThresholds: { low: number; medium: number; high: number };
    featureFlags: Record<string, boolean>;
    updatedAt: string;
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<PlatformSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState<{ key: string; value: unknown } | null>(null);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    async function loadSettings() {
        try {
            const data = await apiClient<PlatformSettings>("/admin/settings");
            setSettings(data);
        } catch { /* error */ }
        setLoading(false);
    }

    useEffect(() => {
        loadSettings();
    }, []);

    async function updateSetting(key: string, value: unknown) {
        setSaving(true);
        setMessage(null);
        try {
            await apiClient(`/admin/settings/${key}`, {
                method: "PATCH",
                body: { value },
            });
            setMessage({ type: "success", text: `Setting "${key}" updated successfully` });
            loadSettings();
        } catch (err) {
            setMessage({ type: "error", text: err instanceof ApiError ? err.message : "Failed to update setting" });
        } finally {
            setSaving(false);
            setShowConfirm(null);
        }
    }

    if (loading) return <div className="text-admin-muted">Loading settings...</div>;

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-admin-primary">Platform Settings</h1>

            {message && (
                <div className={`mb-4 rounded-lg p-3 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {message.text}
                </div>
            )}

            {/* Fee Settings */}
            <section className="mb-6 rounded-xl border border-admin-border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Fee Configuration</h2>
                <div className="space-y-4">
                    <SettingRow
                        label="Platform Fee Percentage"
                        value={`${settings?.platformFeePercentage ?? 7.5}%`}
                        description="Applied to each escrow release"
                        onEdit={() => {
                            const val = prompt("New platform fee percentage:", String(settings?.platformFeePercentage ?? 7.5));
                            if (val) setShowConfirm({ key: "platformFeePercentage", value: Number(val) });
                        }}
                    />
                </div>
            </section>

            {/* Tier Settings */}
            <section className="mb-6 rounded-xl border border-admin-border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Tier & Invite Limits</h2>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-admin-muted">Free tier invites</span>
                        <p className="text-lg font-bold">{settings?.inviteLimitPerTier?.free ?? 2}</p>
                    </div>
                    <div>
                        <span className="text-admin-muted">Verified tier invites</span>
                        <p className="text-lg font-bold">{settings?.inviteLimitPerTier?.verified ?? 5}</p>
                    </div>
                    <div>
                        <span className="text-admin-muted">Pro tier invites</span>
                        <p className="text-lg font-bold">{settings?.inviteLimitPerTier?.pro ?? 10}</p>
                    </div>
                </div>
            </section>

            {/* Reputation Thresholds */}
            <section className="mb-6 rounded-xl border border-admin-border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Reputation Thresholds</h2>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-admin-muted">Low</span>
                        <p className="text-lg font-bold">{settings?.reputationThresholds?.low ?? 20}</p>
                    </div>
                    <div>
                        <span className="text-admin-muted">Medium</span>
                        <p className="text-lg font-bold">{settings?.reputationThresholds?.medium ?? 50}</p>
                    </div>
                    <div>
                        <span className="text-admin-muted">High</span>
                        <p className="text-lg font-bold">{settings?.reputationThresholds?.high ?? 80}</p>
                    </div>
                </div>
            </section>

            {/* Feature Flags */}
            <section className="rounded-xl border border-admin-border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Feature Flags</h2>
                {settings?.featureFlags && Object.keys(settings.featureFlags).length > 0 ? (
                    <div className="space-y-3">
                        {Object.entries(settings.featureFlags).map(([flag, enabled]) => (
                            <div key={flag} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{flag}</span>
                                <span className={`text-sm font-medium ${enabled ? "text-admin-success" : "text-admin-muted"}`}>
                                    {enabled ? "Enabled" : "Disabled"}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-admin-muted">No feature flags configured</p>
                )}
            </section>

            {/* Confirmation Dialog */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-sm rounded-xl bg-white p-6">
                        <h3 className="mb-2 text-lg font-semibold">Confirm Setting Change</h3>
                        <p className="mb-4 text-sm text-admin-muted">
                            Update <strong>{showConfirm.key}</strong> to <strong>{String(showConfirm.value)}</strong>?
                            This change takes effect immediately.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowConfirm(null)} className="rounded-lg border border-admin-border px-4 py-2 text-sm">Cancel</button>
                            <button
                                onClick={() => updateSetting(showConfirm.key, showConfirm.value)}
                                disabled={saving}
                                className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SettingRow({ label, value, description, onEdit }: {
    label: string;
    value: string;
    description: string;
    onEdit: () => void;
}) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <p className="text-xs text-admin-muted">{description}</p>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-admin-primary">{value}</span>
                <button onClick={onEdit} className="rounded border border-admin-border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50">
                    Edit
                </button>
            </div>
        </div>
    );
}
