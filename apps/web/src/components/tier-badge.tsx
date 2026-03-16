import type { MemberTier } from "@vvs/contracts";

const TIER_CONFIG: Record<MemberTier, { label: string; className: string; icon: string }> = {
    free: { label: "Free", className: "bg-tier-free/10 text-tier-free", icon: "" },
    verified: { label: "Verified", className: "bg-tier-verified/10 text-tier-verified", icon: "✓" },
    pro: { label: "Pro", className: "bg-tier-pro/10 text-tier-pro", icon: "★" },
};

type Props = {
    tier: MemberTier;
    size?: "sm" | "lg";
};

export function TierBadge({ tier, size = "sm" }: Props) {
    const config = TIER_CONFIG[tier];
    const sizeClass = size === "lg" ? "px-3 py-1.5 text-sm" : "px-2 py-0.5 text-xs";

    return (
        <span className={`inline-flex items-center gap-1 rounded-full font-medium ${config.className} ${sizeClass}`}>
            {config.icon && <span>{config.icon}</span>}
            {config.label}
        </span>
    );
}
