"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

type Opportunity = {
    id: string;
    title: string;
    brand: string;
    brandLogo?: string;
    isVerifiedBrand: boolean;
    type: "Gigs" | "Grants" | "Castings" | "Residencies" | "Brand Activations" | "Collaborations" | "Competitions";
    category: "Fashion" | "Film" | "Photography" | "Music" | "Tech" | "Culture";
    location: string;
    deadline: string;
    budget: string;
    xpReward: string;
    description: string;
};

const MOCK_OPPORTUNITIES: Opportunity[] = [
    {
        id: "opp-1",
        title: "Lead Stylist for VVS Lagos Runway Activation",
        brand: "VVS Lagos",
        brandLogo: "⚡",
        isVerifiedBrand: true,
        type: "Castings",
        category: "Fashion",
        location: "Lagos, Nigeria",
        deadline: "June 15, 2026",
        budget: "₦450,000",
        xpReward: "+150 XP",
        description: "Seeking an avant-garde lead stylist to direct styling for the upcoming high-fashion capsule drop. Experience with premium African labels is highly preferred."
    },
    {
        id: "opp-2",
        title: "CoraPay Creator Grant 2026",
        brand: "CoraPay",
        brandLogo: "💳",
        isVerifiedBrand: true,
        type: "Grants",
        category: "Tech",
        location: "Remote / Pan-African",
        deadline: "July 01, 2026",
        budget: "₦2,500,000",
        xpReward: "+300 XP",
        description: "Sponsoring 3 digital creatives building open source libraries, plugins, or tools targeting the next generation of African digital artists."
    },
    {
        id: "opp-3",
        title: "Visual Director for Nike Pan-African Campaign",
        brand: "Nike Africa",
        brandLogo: "✔️",
        isVerifiedBrand: true,
        type: "Brand Activations",
        category: "Film",
        location: "Nairobi, Kenya",
        deadline: "June 20, 2026",
        budget: "₦1,800,000",
        xpReward: "+200 XP",
        description: "A collaborative film campaign highlighting runner subcultures across East Africa. Seeking a director with strong cinematic storytelling and grainy, authentic film textures."
    },
    {
        id: "opp-4",
        title: "Music Producer Residency: Johannesburg Sound Lab",
        brand: "Soma Records",
        brandLogo: "🎹",
        isVerifiedBrand: true,
        type: "Residencies",
        category: "Music",
        location: "Johannesburg, South Africa",
        deadline: "August 10, 2026",
        budget: "Fully Funded + Stipend",
        xpReward: "+250 XP",
        description: "A 4-week intensive studio residency focusing on fusion of Amapiano with global electronic subgenres. Includes access to state-of-the-art synthesizers."
    },
    {
        id: "opp-5",
        title: "Exhibition Space at VVS Private Showcase",
        brand: "The Gallery",
        brandLogo: "🎨",
        isVerifiedBrand: true,
        type: "Competitions",
        category: "Culture",
        location: "Accra, Ghana",
        deadline: "June 18, 2026",
        budget: "₦600,000 Prize Pool",
        xpReward: "+120 XP",
        description: "Submit your latest digital artwork or high-fashion photography. Top 5 selections will receive featured physical exhibition space and travel stipends."
    },
    {
        id: "opp-6",
        title: "Model Casting: Orange Culture SS27 Campaign",
        brand: "Orange Culture",
        brandLogo: "🍊",
        isVerifiedBrand: true,
        type: "Castings",
        category: "Fashion",
        location: "Lagos, Nigeria",
        deadline: "June 12, 2026",
        budget: "₦300,000",
        xpReward: "+100 XP",
        description: "Looking for non-conforming gender-neutral models for the SS27 editorial shoot. No formal experience required, agency models and street-scouted welcome."
    }
];

const OPPORTUNITY_TYPES = ["All", "Gigs", "Grants", "Castings", "Brand Activations", "Residencies", "Competitions"] as const;
const CATEGORIES = ["All", "Fashion", "Film", "Photography", "Music", "Tech", "Culture"] as const;

export default function DiscoverPage() {
    const { user, addXp } = useAuth();
    const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
    const [selectedType, setSelectedType] = useState<string>("All");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [savedOpps, setSavedOpps] = useState<string[]>([]);
    
    // Application checkout flow states
    const [applyingOpp, setApplyingOpp] = useState<Opportunity | null>(null);
    const [portfolioUrl, setPortfolioUrl] = useState("");
    const [pitchText, setPitchText] = useState("");
    const [isApplied, setIsApplied] = useState(false);
    const [isApplying, setIsApplying] = useState(false);

    // Filter logic
    const filteredOpportunities = opportunities.filter((opp) => {
        const matchesType = selectedType === "All" || opp.type === selectedType;
        const matchesCategory = selectedCategory === "All" || opp.category === selectedCategory;
        const matchesSearch = 
            opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            opp.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            opp.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesCategory && matchesSearch;
    });

    const toggleSave = (id: string) => {
        setSavedOpps((prev) => 
            prev.includes(id) ? prev.filter((oId) => oId !== id) : [...prev, id]
        );
    };

    const handleApplyClick = (opp: Opportunity) => {
        setApplyingOpp(opp);
        setIsApplied(false);
        setPortfolioUrl("");
        setPitchText("");
    };

    const handleApplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsApplying(true);

        // Simulate secure API submission
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        setIsApplying(false);
        setIsApplied(true);
        addXp(50); // Reward the user for applying

        // Close after brief delay
        setTimeout(() => {
            setApplyingOpp(null);
            setIsApplied(false);
        }, 2000);
    };

    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            {/* Page Header */}
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <span className="mono-caps text-xs text-vvs-accent font-semibold tracking-widest">Opportunity Core</span>
                    <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">DISCOVER GIGS & CREATIVES</h1>
                    <p className="mt-2 text-text-secondary max-w-xl text-sm leading-relaxed">
                        Curated daily high-value opportunities, casting briefs, visual grants, and brand activations across Africa. Apply directly with your VVS digital reputation.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="w-full max-w-xs">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search opportunities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="glass-input w-full rounded-lg px-4 py-2.5 pl-10 text-xs text-white placeholder-text-muted focus:outline-none"
                        />
                        <span className="absolute left-3.5 top-3.5 text-xs opacity-50">🔍</span>
                    </div>
                </div>
            </div>

            {/* Quick Profile Summary Card */}
            {user && (
                <div className="glass-card glow-accent mb-10 p-6 rounded-xl flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-vvs-accent/20 flex items-center justify-center text-3xl border border-vvs-accent/30 shadow-[0_0_15px_rgba(255,59,92,0.2)]">
                            ⚡
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold">{user.name}</h3>
                                <span className="mono-caps text-[9px] bg-vvs-gold/15 text-vvs-gold border border-vvs-gold/30 px-2 py-0.5 rounded">
                                    {user.reputationLevel ?? "Visionary"}
                                </span>
                            </div>
                            <p className="text-xs text-text-secondary mt-0.5">{user.discipline ?? "Creative Director"}</p>
                            
                            {/* Streak Progression Bar */}
                            <div className="mt-3 flex items-center gap-3">
                                <span className="text-[10px] text-text-secondary font-mono">Streak Momentum:</span>
                                <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-vvs-accent" style={{ width: "60%" }}></div>
                                </div>
                                <span className="text-[10px] text-vvs-accent font-bold font-mono">3 Days 🔥</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 text-center divide-x divide-white/5 w-full md:w-auto">
                        <div className="px-4">
                            <div className="text-xl font-bold font-mono text-white">450</div>
                            <div className="text-[9px] text-text-secondary mono-caps mt-1">Total XP</div>
                        </div>
                        <div className="px-4">
                            <div className="text-xl font-bold font-mono text-vvs-gold">Lv. 4</div>
                            <div className="text-[9px] text-text-secondary mono-caps mt-1">Tier Level</div>
                        </div>
                        <div className="px-4">
                            <div className="text-xl font-bold font-mono text-vvs-blue">14</div>
                            <div className="text-[9px] text-text-secondary mono-caps mt-1">Applications</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="mb-8 space-y-4">
                {/* Type Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {OPPORTUNITY_TYPES.map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`mono-caps text-[10px] font-semibold tracking-wider px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                                selectedType === type 
                                    ? "bg-white text-black font-extrabold" 
                                    : "bg-white/5 text-text-secondary border border-white/5 hover:text-white hover:bg-white/10"
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Category Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`text-xs px-3.5 py-1.5 rounded-md transition-all whitespace-nowrap ${
                                selectedCategory === category 
                                    ? "text-vvs-accent bg-vvs-accent/10 font-bold border border-vvs-accent/25" 
                                    : "text-text-secondary hover:text-white hover:bg-white/5"
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Opportunities Feed Grid */}
            {filteredOpportunities.length === 0 ? (
                <div className="glass-panel text-center py-20 rounded-xl max-w-xl mx-auto">
                    <span className="text-4xl">📭</span>
                    <h3 className="text-lg font-bold mt-4">No Opportunities Found</h3>
                    <p className="text-xs text-text-secondary mt-1">Try tweaking your category or active search filters.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {filteredOpportunities.map((opp) => (
                        <div key={opp.id} className="glass-card p-6 rounded-xl flex flex-col justify-between h-full relative group">
                            {/* Accent indicator glow */}
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-vvs-accent/45 transition-all duration-300" />
                            
                            <div>
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-9 w-9 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-lg shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                                            {opp.brandLogo ?? "⚡"}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <h4 className="text-xs font-bold text-white leading-none">{opp.brand}</h4>
                                                {opp.isVerifiedBrand && (
                                                    <span className="text-[9px] text-vvs-blue" title="Verified Creative Brand">✓</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-text-secondary mt-1 leading-none">{opp.location}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] mono-caps bg-white/5 text-text-secondary border border-white/5 px-2 py-0.5 rounded">
                                            {opp.type}
                                        </span>
                                        <button 
                                            onClick={() => toggleSave(opp.id)}
                                            className="text-sm p-1.5 rounded-full hover:bg-white/5 transition-all"
                                            title="Save for later"
                                        >
                                            {savedOpps.includes(opp.id) ? "💖" : "🖤"}
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-base font-bold leading-snug text-white hover:text-vvs-accent transition-colors">
                                    {opp.title}
                                </h3>
                                <p className="text-xs text-text-secondary mt-2.5 line-clamp-3 leading-relaxed">
                                    {opp.description}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-4">
                                <div className="flex items-center justify-between text-[11px] font-mono">
                                    <div>
                                        <span className="text-text-muted">Budget:</span>
                                        <span className="text-vvs-gold font-bold ml-1">{opp.budget}</span>
                                    </div>
                                    <div>
                                        <span className="text-text-muted">Reward:</span>
                                        <span className="text-vvs-blue font-bold ml-1">{opp.xpReward}</span>
                                    </div>
                                    <div>
                                        <span className="text-text-muted">Deadline:</span>
                                        <span className="text-text-secondary font-semibold ml-1">{opp.deadline}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleApplyClick(opp)}
                                    className="w-full text-center mono-caps text-[10px] font-bold py-3 bg-white text-black rounded-lg transition-all duration-300 hover:bg-vvs-accent hover:text-white glow-accent hover:scale-[1.01]"
                                >
                                    Quick Apply Via Reputation
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Application Flow Dialog overlay (CoraPay embedded) */}
            {applyingOpp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
                    <div className="glass-panel max-w-md w-full p-8 rounded-xl relative overflow-hidden animate-float">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-vvs-accent via-vvs-blue to-vvs-gold" />
                        
                        <button
                            onClick={() => setApplyingOpp(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all text-sm"
                        >
                            ✕
                        </button>

                        {!isApplied ? (
                            <form onSubmit={handleApplySubmit} className="space-y-6">
                                <div className="text-center">
                                    <span className="mono-caps text-[9px] text-vvs-gold font-bold tracking-widest border border-vvs-gold/30 px-2.5 py-1 rounded bg-vvs-gold/5">
                                        CoraPay Secured Application
                                    </span>
                                    <h2 className="text-xl font-bold mt-3 leading-tight">Apply to Opportunity</h2>
                                    <p className="text-xs text-vvs-accent font-semibold mt-1 font-mono">{applyingOpp.title}</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] mono-caps text-text-secondary mb-1">Reputation Verification</label>
                                        <div className="bg-white/5 rounded-lg border border-white/5 p-3.5 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span>✓</span>
                                                <span className="text-white font-semibold">Reputation Level Verified</span>
                                            </div>
                                            <span className="text-[10px] text-vvs-blue font-mono">Lv. 4 Status</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="portfolio" className="block text-[10px] mono-caps text-text-secondary mb-1">Portfolio Link</label>
                                        <input
                                            id="portfolio"
                                            type="url"
                                            required
                                            value={portfolioUrl}
                                            onChange={(e) => setPortfolioUrl(e.target.value)}
                                            placeholder="https://behance.net/yourprofile"
                                            className="glass-input w-full rounded-lg px-3.5 py-2.5 text-xs text-white"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="pitch" className="block text-[10px] mono-caps text-text-secondary mb-1">Creative Pitch</label>
                                        <textarea
                                            id="pitch"
                                            required
                                            rows={3}
                                            value={pitchText}
                                            onChange={(e) => setPitchText(e.target.value)}
                                            placeholder="Briefly state why you're a fit for this campaign..."
                                            className="glass-input w-full rounded-lg px-3.5 py-2.5 text-xs text-white resize-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isApplying}
                                    className="w-full text-center mono-caps text-[11px] font-bold py-3.5 bg-white text-black hover:bg-vvs-accent hover:text-white rounded-lg transition-all glow-accent flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isApplying ? (
                                        <>
                                            <span className="animate-spin text-sm">⚡</span>
                                            Signing Contract...
                                        </>
                                    ) : (
                                        "Sign & Submit Contract"
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-10 space-y-4">
                                <div className="h-16 w-16 bg-vvs-green/10 border border-vvs-green/30 rounded-full flex items-center justify-center text-3xl mx-auto shadow-[0_0_15px_rgba(0,230,118,0.2)]">
                                    ✓
                                </div>
                                <h3 className="text-lg font-bold text-white">Application Submitted!</h3>
                                <p className="text-xs text-text-secondary max-w-xs mx-auto">
                                    Your profile, verified credentials, and pitch have been secured on-chain. You earned <span className="text-vvs-blue font-bold">+50 XP</span>.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
