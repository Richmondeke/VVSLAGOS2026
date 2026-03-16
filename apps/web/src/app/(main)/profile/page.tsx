"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { TierBadge } from "@/components/tier-badge";
import { AvailabilityIndicator } from "@/components/availability-indicator";
import { RatingDisplay } from "@/components/rating-display";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import type { MemberTier } from "@vvs/contracts";

type Profile = {
    id: string;
    userId: string;
    displayName: string;
    bio: string;
    profession: string;
    category: string;
    skills: string[];
    avatarUrl: string | null;
    tier: MemberTier;
    availability: string;
    rating: number;
    transactionCount: number;
    referredBy: string | null;
};

export default function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [availability, setAvailability] = useState("available");

    useEffect(() => {
        (async () => {
            try {
                const data = await apiClient<Profile>("/members/profiles/me");
                setProfile(data);
                setAvailability(data.availability ?? "available");
            } catch {
                // not found
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    async function toggleAvailability() {
        const next = availability === "available" ? "busy" : availability === "busy" ? "unavailable" : "available";
        setAvailability(next);
        try {
            await apiClient("/members/profiles/me", {
                method: "PATCH",
                body: { availability: next },
            });
        } catch {
            setAvailability(availability); // revert
        }
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-2xl space-y-4 p-4">
                <LoadingSkeleton className="h-32" />
                <LoadingSkeleton className="h-48" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="mx-auto max-w-2xl p-4 text-center">
                <p className="mb-4 text-gray-600">Profile not set up yet.</p>
                <Link href="/welcome" className="text-vvs-accent hover:underline">
                    Complete onboarding
                </Link>
            </div>
        );
    }

    const proThreshold = 10;
    const remaining = Math.max(0, proThreshold - profile.transactionCount);

    return (
        <div className="mx-auto max-w-2xl p-4">
            {/* Header */}
            <div className="mb-6 flex items-start gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-3xl">
                    {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                        "👤"
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold">{profile.displayName || user?.email}</h1>
                        <TierBadge tier={profile.tier} />
                    </div>
                    <p className="text-sm text-gray-500">{profile.profession}</p>
                    <button onClick={toggleAvailability} className="mt-1">
                        <AvailabilityIndicator status={availability as any} />
                    </button>
                </div>
                <Link
                    href="/profile/edit"
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Edit
                </Link>
            </div>

            {/* Bio */}
            {profile.bio && (
                <div className="mb-6">
                    <h2 className="mb-2 font-semibold">About</h2>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{profile.bio}</p>
                </div>
            )}

            {/* Skills */}
            {profile.skills?.length > 0 && (
                <div className="mb-6">
                    <h2 className="mb-2 font-semibold">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
                            <span key={skill} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-white p-4 text-center border border-gray-200">
                    <RatingDisplay mode="read" rating={profile.rating} count={profile.transactionCount} />
                    <div className="mt-1 text-xs text-gray-500">
                        {profile.transactionCount < 3 ? "New member" : `${profile.transactionCount} transactions`}
                    </div>
                </div>
                <div className="rounded-lg bg-white p-4 text-center border border-gray-200">
                    <div className="text-lg font-bold text-vvs-primary">{profile.tier}</div>
                    {profile.tier !== "pro" && remaining > 0 && (
                        <div className="mt-1 text-xs text-gray-500">
                            {remaining} more transaction{remaining > 1 ? "s" : ""} to reach Pro
                        </div>
                    )}
                </div>
            </div>

            {/* Referral */}
            {profile.referredBy && (
                <div className="mb-6 text-sm text-gray-500">
                    Referred by <span className="font-medium text-gray-700">{profile.referredBy}</span>
                </div>
            )}
        </div>
    );
}
