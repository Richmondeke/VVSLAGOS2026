"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

type SocialPost = {
    id: string;
    creatorName: string;
    creatorAvatar: string;
    creatorDiscipline: string;
    mediaUrl: string;
    caption: string;
    location: string;
    metadata: {
        camera?: string;
        lens?: string;
        time?: string;
    };
    vouches: number;
    hasVouched: boolean;
};

type Channel = {
    id: string;
    name: string;
    description: string;
};

type ChatMessage = {
    id: string;
    channelId: string;
    senderName: string;
    senderAvatar: string;
    senderDiscipline: string;
    content: string;
    timestamp: string;
};

const INITIAL_CHANNELS: Channel[] = [
    { id: "ch-1", name: "runway-SS27", description: "SS27 collection drapes, fitting dockets, and street aesthetics." },
    { id: "ch-2", name: "textile-design", description: "Nigerian-woven heavy textiles and organic print engineering." },
    { id: "ch-3", name: "lagos-art-scene", description: "Subcultures, archival photography, and Ikoyi showroom news." }
];

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
    {
        id: "m-1",
        channelId: "ch-1",
        senderName: "Amina Yusuf",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        senderDiscipline: "Afromodernist Textile Designer",
        content: "The custom heavyweight leather panel drapes arrived at Shitta studio today. SS27 is officially going to choke.",
        timestamp: "04:12 PM"
    },
    {
        id: "m-2",
        channelId: "ch-1",
        senderName: "Tunde Olayinka",
        senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        senderDiscipline: "Utilitarian Fashion Architect",
        content: "No caps. The modular pocket fittings on the canvas outerwear are extremely heavy. Ready for fitting tests.",
        timestamp: "04:15 PM"
    },
    {
        id: "m-3",
        channelId: "ch-1",
        senderName: "Zara Coker",
        senderAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
        senderDiscipline: "Art Director & Lead Stylist",
        content: "Are we directing the lookbook shoot in Surulere? Let's keep the raw street-grain aesthetic, no soft filters.",
        timestamp: "04:18 PM"
    },
    {
        id: "m-4",
        channelId: "ch-2",
        senderName: "Kofi Mensah",
        senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        senderDiscipline: "Avant-Garde Jewelry Maker",
        content: "Just casted the first prototype solid brass accessory nodes in the Yaba furnace. They have serious weight.",
        timestamp: "02:30 PM"
    },
    {
        id: "m-5",
        channelId: "ch-2",
        senderName: "Amina Yusuf",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        senderDiscipline: "Afromodernist Textile Designer",
        content: "Kofi! Drop the pictures in the thread. Do they match the modular SS27 buckle fittings?",
        timestamp: "02:35 PM"
    },
    {
        id: "m-6",
        channelId: "ch-3",
        senderName: "Nneka Okafor",
        senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        senderDiscipline: "Visual Storyteller",
        content: "Who is attending the private collector's showroom preview in Ikoyi this Friday? Let's roll together.",
        timestamp: "11:05 AM"
    },
    {
        id: "m-7",
        channelId: "ch-3",
        senderName: "Tunde Olayinka",
        senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        senderDiscipline: "Utilitarian Outerwear Architect",
        content: "I will be there with the original silk-screen canvases. Form a proper convoy.",
        timestamp: "11:12 AM"
    }
];

const MOCK_POSTS: SocialPost[] = [
    {
        id: "post-1",
        creatorName: "Amina Yusuf",
        creatorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        creatorDiscipline: "Textile Designer",
        mediaUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
        caption: "SS27 Utilitarian Outerwear drape test. Looking for a 3D digital modeler to help render digital textures before sampling next week. Handshake me if you have high craft.",
        location: "LAGOS // SHITTA STUDIO",
        metadata: {
            camera: "HASSELBLAD H6D",
            lens: "80MM F/1.8",
            time: "12:04PM WAT"
        },
        vouches: 42,
        hasVouched: false
    },
    {
        id: "post-2",
        creatorName: "Tunde Olayinka",
        creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        creatorDiscipline: "Outerwear Architect",
        mediaUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80",
        caption: "Unreleased print tests for VVS Mascot redesign. Spray paint and heavy acrylics on 100% heavyweight cotton canvas. Vouch the design.",
        location: "LAGOS // SURULERE MAIN",
        metadata: {
            camera: "LEICA M11",
            lens: "35MM SUMMILUX",
            time: "03:42PM WAT"
        },
        vouches: 89,
        hasVouched: true
    },
    {
        id: "post-3",
        creatorName: "Zara Coker",
        creatorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
        creatorDiscipline: "Art Director",
        mediaUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
        caption: "Raw runway backstage stills from Tokyo showroom drop. The texture transitions on the leather panels are pure heat.",
        location: "TOKYO // BACKSTAGE",
        metadata: {
            camera: "SONY FX3",
            lens: "24-70MM G-MASTER",
            time: "09:15AM JST"
        },
        vouches: 114,
        hasVouched: false
    }
];

const MATCHMAKER_POOL = [
    {
        name: "Zara Coker",
        avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
        discipline: "Art Director & Lead Stylist",
        synergy: "98% Synergy",
        project: "Bespoke Outerwear Lookbook Campaign",
        reason: "Your high-fashion design aligns seamlessly with Zara's archive-inspired gritty Surulere styling concepts."
    },
    {
        name: "Amina Yusuf",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        discipline: "Afromodernist Textile Designer",
        synergy: "95% Synergy",
        project: "Structured Heavy Canvas Utility Capsule",
        reason: "Combine Amina's geometric Yoruba architectural fabrics with your premium utilitarian silhouettes."
    },
    {
        name: "Tunde Olayinka",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        discipline: "Utilitarian Outerwear Architect",
        synergy: "92% Synergy",
        project: "Surulere Showcase Mascot Canvas Art",
        reason: "Collaborative heavy silk-screen canvas study with customized raw brass rivets and metal buckle plates."
    }
];

export default function SocialPage() {
    const { user, addXp } = useAuth();
    const [posts, setPosts] = useState<SocialPost[]>(MOCK_POSTS);
    
    // Switch state between Editorial Feed and Channel Chats
    const [selectedView, setSelectedView] = useState<"editorial" | string>("editorial");
    
    // Channels State
    const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
    const [newMessage, setNewMessage] = useState("");
    
    // Channel Creation Modal States
    const [isCreatingChannel, setIsCreatingChannel] = useState(false);
    const [newChannelName, setNewChannelName] = useState("");
    const [newChannelDesc, setNewChannelDesc] = useState("");

    // Matchmaker States
    const [isMatching, setIsMatching] = useState(false);
    const [matchResult, setMatchResult] = useState<typeof MATCHMAKER_POOL[0] | null>(null);

    const handleVouch = (postId: string) => {
        setPosts(prev =>
            prev.map(post => {
                if (post.id === postId) {
                    const nextVouched = !post.hasVouched;
                    if (nextVouched) {
                        addXp(25);
                    }
                    return {
                        ...post,
                        hasVouched: nextVouched,
                        vouches: post.vouches + (nextVouched ? 1 : -1)
                    };
                }
                return post;
            })
        );
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || selectedView === "editorial") return;

        const msg: ChatMessage = {
            id: `msg-${Date.now()}`,
            channelId: selectedView,
            senderName: user?.name || "Amina Osei",
            senderAvatar: user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
            senderDiscipline: user?.discipline || "Sovereign Designer",
            content: newMessage.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatMessages(prev => [...prev, msg]);
        setNewMessage("");
        addXp(10); // Reward active banter participation
    };

    const handleCreateChannel = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChannelName.trim()) return;

        const cleanName = newChannelName.toLowerCase().replace(/\s+/g, "-");
        const newChan: Channel = {
            id: `ch-${Date.now()}`,
            name: cleanName,
            description: newChannelDesc.trim() || "No description provided."
        };

        setChannels(prev => [...prev, newChan]);
        setNewChannelName("");
        setNewChannelDesc("");
        setIsCreatingChannel(false);
        setSelectedView(newChan.id); // Switch directly to the new channel
        addXp(30); // Reward active community organization
    };

    const handleInitiateMatchmaking = () => {
        setIsMatching(true);
        setMatchResult(null);

        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * MATCHMAKER_POOL.length);
            setMatchResult(MATCHMAKER_POOL[randomIndex]);
            setIsMatching(false);
            addXp(50); // Reward status XP for initiating high-synergy networking
        }, 1800);
    };

    // Get current active channel object
    const activeChannel = channels.find(c => c.id === selectedView);
    // Get active channel's message history
    const activeChannelMessages = chatMessages.filter(m => m.channelId === selectedView);

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-0">
            {/* Page Header */}
            <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-text-secondary/10 pb-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight md:text-6xl text-text-primary uppercase leading-none">
                        Socials
                    </h1>
                    <p className="text-text-secondary max-w-2xl text-sm leading-relaxed">
                        The real-time collaboration hub. Chat live in specialized community channels, vouch for editorial showcase posts, or trigger the AI event matchmaker to align your creative energies.
                    </p>
                </div>
            </div>

            {/* Three-Column Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* COLUMN 1 (Left Sidebar): Channels Navigation (Span 3) */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-card p-5 rounded-2xl border border-text-secondary/5 space-y-4">
                        <div className="flex items-center justify-between border-b border-text-secondary/5 pb-3">
                            <span className="text-[10px] font-bold font-mono tracking-wider text-text-muted">CHANNELS</span>
                            <button 
                                onClick={() => setIsCreatingChannel(true)}
                                className="text-[10px] font-bold font-mono text-vvs-accent hover:text-vvs-accent/80 transition-colors"
                            >
                                + CREATE
                            </button>
                        </div>

                        {/* Navigation List */}
                        <div className="space-y-1">
                            <button
                                onClick={() => setSelectedView("editorial")}
                                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
                                    selectedView === "editorial"
                                        ? "bg-text-primary text-vvs-bg"
                                        : "text-text-secondary hover:text-text-primary hover:bg-text-primary/5"
                                }`}
                            >
                                <span className="text-sm">✨</span>
                                <span>Editorial Feed</span>
                            </button>

                            <div className="pt-3 border-t border-text-secondary/5 mt-3 space-y-1">
                                {channels.map((ch) => (
                                    <button
                                        key={ch.id}
                                        onClick={() => setSelectedView(ch.id)}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                                            selectedView === ch.id
                                                ? "bg-text-primary text-vvs-bg font-bold"
                                                : "text-text-secondary hover:text-text-primary hover:bg-text-primary/5"
                                        }`}
                                    >
                                        <span className="truncate"># {ch.name}</span>
                                        {selectedView !== ch.id && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-vvs-accent animate-pulse" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMN 2 (Middle View): Main Feed or Live Chat (Span 6) */}
                <div className="lg:col-span-6 space-y-6">
                    
                    {/* View State: Editorial Feed */}
                    {selectedView === "editorial" && (
                        <div className="space-y-8">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="glass-card rounded-2xl overflow-hidden border border-text-secondary/5 flex flex-col group"
                                >
                                    {/* Creator Header */}
                                    <div className="p-4 flex items-center justify-between border-b border-text-secondary/5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full border border-text-secondary/10 overflow-hidden bg-text-secondary/5">
                                                <img src={post.creatorAvatar} alt="" className="h-full w-full object-cover" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-xs font-bold text-text-primary leading-none">{post.creatorName}</h4>
                                                <span className="text-[9px] mono-caps text-text-secondary">{post.creatorDiscipline}</span>
                                            </div>
                                        </div>
                                        <span className="mono-caps text-[8px] bg-vvs-gold/10 text-vvs-gold border border-vvs-gold/20 px-2 py-0.5 rounded-full font-bold">
                                            Verified Vanguard
                                        </span>
                                    </div>

                                    {/* Post Image with Grayscale-to-color transition. No shadow, no padded borders around the image. */}
                                    <div className="relative aspect-square overflow-hidden bg-black">
                                        <img
                                            src={post.mediaUrl}
                                            alt=""
                                            className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-102"
                                        />
                                        
                                        <div className="absolute top-4 left-4 bg-vvs-bg/85 border border-text-secondary/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                                            <span className="text-[9px] font-bold font-mono tracking-widest text-text-primary">{post.location}</span>
                                        </div>
                                    </div>

                                    {/* Post Details */}
                                    <div className="p-5 space-y-4">
                                        <p className="text-xs text-text-primary leading-relaxed font-medium">
                                            {post.caption}
                                        </p>

                                        {/* Technical Metadata */}
                                        <div className="grid grid-cols-3 gap-2 border-t border-b border-text-secondary/5 py-3 text-center">
                                            <div>
                                                <span className="block text-[8px] text-text-muted mono-caps">BODY</span>
                                                <span className="text-[9px] font-mono font-bold text-text-secondary truncate block">{post.metadata.camera ?? "N/A"}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[8px] text-text-muted mono-caps">GLASS</span>
                                                <span className="text-[9px] font-mono font-bold text-text-secondary truncate block">{post.metadata.lens ?? "N/A"}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[8px] text-text-muted mono-caps">TIMESTAMP</span>
                                                <span className="text-[9px] font-mono font-bold text-text-secondary truncate block">{post.metadata.time ?? "N/A"}</span>
                                            </div>
                                        </div>

                                        {/* Vouch Button Interaction */}
                                        <button
                                            onClick={() => handleVouch(post.id)}
                                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-full text-[10px] font-bold mono-caps tracking-widest border transition-all cursor-pointer ${
                                                post.hasVouched
                                                    ? "bg-vvs-accent/10 border-vvs-accent text-vvs-accent glow-accent"
                                                    : "bg-transparent border-text-secondary/15 text-text-secondary hover:text-text-primary hover:border-text-primary"
                                            }`}
                                        >
                                            <span>✨</span>
                                            <span>VOUCH ({post.vouches})</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* View State: Live Channel Chat */}
                    {selectedView !== "editorial" && activeChannel && (
                        <div className="glass-card rounded-2xl border border-text-secondary/5 h-[620px] flex flex-col justify-between overflow-hidden relative">
                            {/* Chat Header */}
                            <div className="p-5 border-b border-text-secondary/5 bg-text-primary/[0.02]">
                                <h3 className="text-sm font-bold text-text-primary"># {activeChannel.name}</h3>
                                <p className="text-[10px] text-text-secondary leading-none mt-1">{activeChannel.description}</p>
                            </div>

                            {/* Chat History Logs */}
                            <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin">
                                {activeChannelMessages.length === 0 ? (
                                    <div className="text-center py-20 text-text-muted">
                                        <span className="text-2xl">💬</span>
                                        <p className="text-xs font-mono uppercase tracking-wider mt-2">Zero banter. Start the dialogue.</p>
                                    </div>
                                ) : (
                                    activeChannelMessages.map((msg) => (
                                        <div key={msg.id} className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-full overflow-hidden border border-text-secondary/10 bg-text-secondary/5 shrink-0">
                                                <img src={msg.senderAvatar} alt="" className="h-full w-full object-cover" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-baseline justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-bold text-text-primary leading-none">{msg.senderName}</span>
                                                        <span className="text-[8px] mono-caps bg-text-primary/5 text-text-secondary px-1.5 py-0.5 rounded font-bold leading-none">{msg.senderDiscipline}</span>
                                                    </div>
                                                    <span className="text-[8px] font-mono text-text-muted shrink-0 ml-2">{msg.timestamp}</span>
                                                </div>
                                                <p className="text-xs text-text-secondary leading-relaxed mt-1">{msg.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Live Message Input Form */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-text-secondary/5 bg-text-primary/[0.01] flex items-center gap-3">
                                <input
                                    type="text"
                                    placeholder={`Message # ${activeChannel.name}...`}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="glass-input w-full rounded-full px-5 py-3 text-xs text-text-primary placeholder-text-muted focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="h-10 w-10 shrink-0 bg-text-primary text-vvs-bg rounded-full flex items-center justify-center font-bold hover:bg-vvs-accent hover:text-text-primary transition-all cursor-pointer text-xs"
                                >
                                    ➔
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* COLUMN 3 (Right Sidebar): AI Event Matchmaker (Span 3) */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-card p-5 rounded-2xl border border-text-secondary/5 space-y-5">
                        <div className="border-b border-text-secondary/5 pb-3">
                            <span className="text-[10px] font-bold font-mono tracking-wider text-text-muted">EVENT MATCHMAKER</span>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs text-text-secondary leading-relaxed">
                                Scan the certified creative pool. Our synergy system matches your profile discipline with other vanguard members to propose elite collaborative events and runway projects.
                            </p>

                            {!matchResult && !isMatching && (
                                <button
                                    onClick={handleInitiateMatchmaking}
                                    className="w-full text-center mono-caps text-[9px] font-bold py-3.5 bg-text-primary text-vvs-bg rounded-full hover:bg-vvs-accent hover:text-text-primary transition-all duration-300 shadow-sm cursor-pointer"
                                >
                                    Initiate Matchmaking
                                </button>
                            )}

                            {isMatching && (
                                <div className="p-4 rounded-xl bg-vvs-gold/5 border border-vvs-gold/20 text-center space-y-3">
                                    <div className="h-6 w-6 border-2 border-vvs-gold border-t-transparent rounded-full animate-spin mx-auto" />
                                    <p className="text-[10px] font-mono text-vvs-gold uppercase tracking-wider font-bold animate-pulse">Scanning Creative Pool...</p>
                                    <span className="block text-[8px] text-text-muted font-mono leading-none">Banding nodes in SURULERE & IKOYI</span>
                                </div>
                            )}

                            {matchResult && !isMatching && (
                                <div className="space-y-4 animate-float">
                                    <div className="p-4 rounded-xl bg-vvs-green/5 border border-vvs-green/20 space-y-3 text-left">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full border border-text-secondary/10 overflow-hidden bg-text-primary/5 shrink-0">
                                                <img src={matchResult.avatarUrl} alt="" className="h-full w-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-xs font-bold text-text-primary truncate">{matchResult.name}</h4>
                                                <span className="text-[9px] text-vvs-gold font-bold font-mono leading-none">{matchResult.synergy}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="block text-[8px] text-text-muted mono-caps">Suggested Venture</span>
                                            <p className="text-xs font-bold text-text-primary leading-tight">{matchResult.project}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="block text-[8px] text-text-muted mono-caps">Synergy Reason</span>
                                            <p className="text-[10px] text-text-secondary leading-relaxed leading-tight">{matchResult.reason}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleInitiateMatchmaking}
                                        className="w-full text-center mono-caps text-[8px] font-bold py-2.5 border border-text-secondary/15 text-text-secondary hover:text-text-primary hover:border-text-primary transition-all rounded-full cursor-pointer"
                                    >
                                        Scan Pool Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Channel Modal Overlay */}
            {isCreatingChannel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
                    <div className="glass-panel max-w-md w-full p-8 rounded-2xl relative overflow-hidden animate-float border border-text-secondary/15 shadow-2xl">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-vvs-accent" />
                        
                        <button
                            onClick={() => setIsCreatingChannel(false)}
                            className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-all text-sm cursor-pointer"
                        >
                            ✕
                        </button>

                        <form onSubmit={handleCreateChannel} className="space-y-6">
                            <div className="text-center space-y-1.5">
                                <span className="mono-caps text-[9px] text-vvs-gold font-bold tracking-widest border border-vvs-gold/25 px-3 py-1 rounded-full bg-vvs-gold/5">
                                    VVS Community core
                                </span>
                                <h2 className="text-xl font-bold text-text-primary mt-1">Create Group Channel</h2>
                                <p className="text-xs text-text-secondary max-w-xs mx-auto">Establish a dedicated chat room for discussing capsule collections, runway setups, or street-scouting dockets.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label htmlFor="chan-name" className="block text-[10px] mono-caps text-text-secondary font-bold">Channel Name</label>
                                    <input
                                        id="chan-name"
                                        type="text"
                                        required
                                        placeholder="e.g. streetwear-SS27"
                                        value={newChannelName}
                                        onChange={(e) => setNewChannelName(e.target.value)}
                                        className="glass-input w-full rounded-full px-4 py-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="chan-desc" className="block text-[10px] mono-caps text-text-secondary font-bold">Channel Description</label>
                                    <textarea
                                        id="chan-desc"
                                        rows={2}
                                        placeholder="Briefly state the goal of this channel room..."
                                        value={newChannelDesc}
                                        onChange={(e) => setNewChannelDesc(e.target.value)}
                                        className="glass-input w-full rounded-xl px-4 py-3 text-xs text-text-primary resize-none placeholder:text-text-muted focus:outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full text-center mono-caps text-[10px] font-bold py-3.5 bg-text-primary text-vvs-bg hover:bg-vvs-accent hover:text-text-primary rounded-full transition-all glow-accent cursor-pointer"
                            >
                                Establish Channel • +30 XP
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
