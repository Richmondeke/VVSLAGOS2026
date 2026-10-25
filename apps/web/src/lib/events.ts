export type EventItem = {
    id: string;
    slug: string;
    fullDate: string;
    date: string;
    title: string;
    venue: string;
    time: string;
    category: string;
    note: string;
    description: string;
    bannerUrl?: string;
    xpCost?: number;
};

export const CURRENT_EVENTS: EventItem[] = [
    {
        id: "monkey-shoulder",
        slug: "monkey-shoulder-event",
        fullDate: "2026-10-25T19:00:00",
        date: "October 25",
        title: "Old Fashioned Monkey Shoulder Event",
        venue: "Penthouse Space, Lagos",
        time: "7:00 PM",
        category: "Tasting & Cocktails",
        note: "Monkey Shoulder Tasting • Curated Cocktails • DJ Sets • VIP Lounge",
        description:
            "An exclusive Old Fashioned tasting evening hosted in collaboration with Monkey Shoulder at the Penthouse Space.",
        bannerUrl:
            "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
        xpCost: 0,
    },
    {
        id: "in-official-flagship",
        slug: "in-official-flagship-launch",
        fullDate: "2026-10-30T18:00:00",
        date: "October 30",
        title: "I.N Official Flagship Launch Event / Launch Party",
        venue: "Penthouse Space, Lagos",
        time: "6:00 PM",
        category: "Fashion Week Launch",
        note: "Flagship Launch • Fashion Week Showcase • Champagne Reception • Designers & VIPs",
        description:
            "Official flagship launch event and party for I.N Official during Lagos Fashion Week at the Penthouse Space.",
        bannerUrl:
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
        xpCost: 0,
    },
    {
        id: "halloween-deeds-magazine",
        slug: "halloween-party-deeds-magazine",
        fullDate: "2026-10-31T20:00:00",
        date: "October 31",
        title: "Halloween Party with Deeds Magazine",
        venue: "Penthouse Space, Lagos",
        time: "8:00 PM",
        category: "Halloween Party",
        note: "Deeds Magazine Collab • Themed Dress Code • Live Performances • Midnight Rave",
        description:
            "The premier Lagos Halloween experience, hosted in partnership with Deeds Magazine at the Penthouse Space. High-fashion costumes, live performances, and late-night sets.",
        bannerUrl:
            "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
        xpCost: 0,
    },
    {
        id: "jagermeister-grill-plan",
        slug: "jagermeister-meisters-of-the-grill",
        fullDate: "2026-10-31T16:00:00",
        date: "October 31",
        title: "Jägermeister Meisters of the Grill Plan",
        venue: "Space Station, Lagos",
        time: "4:00 PM",
        category: "Food & Music Experience",
        note: "Space Station Collaboration • Grill Masters • Ice-Cold Jägermeister • Live DJ Sets",
        description:
            "High-energy grill and chill session powered by Jägermeister in collaboration with Space Station. Ice-cold shots, grill masters, and live music.",
        bannerUrl:
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        xpCost: 0,
    },
    {
        id: "art-x-canex-party",
        slug: "art-x-canex-party",
        fullDate: "2026-11-07T19:00:00",
        date: "November 7",
        title: "Art X and Canex Party",
        venue: "Penthouse Space, Lagos",
        time: "7:00 PM",
        category: "Art & Culture Celebration",
        note: "Art X Lagos • CANEX Celebration • Curated Art Showcase • Cocktails & Networking",
        description:
            "Celebrating contemporary African art and creative enterprise in partnership with Art X and CANEX at the Penthouse Space.",
        bannerUrl:
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
        xpCost: 0,
    },
];

const RSVP_STORAGE_KEY = "vvs-rsvps";

export function getStoredRSVPs(): string[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(RSVP_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveRSVP(eventId: string): string[] {
    if (typeof window === "undefined") return [];
    try {
        const current = getStoredRSVPs();
        if (!current.includes(eventId)) {
            const updated = [...current, eventId];
            localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        }
        return current;
    } catch {
        return [];
    }
}

export function removeRSVP(eventId: string): string[] {
    if (typeof window === "undefined") return [];
    try {
        const current = getStoredRSVPs();
        const updated = current.filter((id) => id !== eventId);
        localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(updated));
        return updated;
    } catch {
        return [];
    }
}
