"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";

type ContentEvent = {
    id: string;
    customSlug: string;
    title: string;
    description: string;
    eventDate: string;
    location: string;
    bannerUrl: string | null;
};

export default function RsvpPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [event, setEvent] = useState<ContentEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        attendance: "yes",
    });

    useEffect(() => {
        async function fetchEvent() {
            try {
                const data = await apiClient<ContentEvent>(`/api/content/events/${slug}`);
                setEvent(data);
            } catch (err: any) {
                setError(err.message || "Event not found");
            } finally {
                setLoading(false);
            }
        }
        if (slug) fetchEvent();
    }, [slug]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await apiClient("/api/content/rsvp", {
                method: "POST",
                body: {
                    name: formData.name,
                    email: formData.email,
                    attendance: formData.attendance,
                    events: [event?.id]
                }
            });
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Failed to submit RSVP");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-vvs-bg">
                <span className="text-4xl animate-pulse">⚡</span>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-vvs-bg p-4 text-center">
                <span className="text-5xl mb-4">📭</span>
                <h1 className="text-2xl font-bold text-text-primary">Event Not Found</h1>
                <p className="text-text-secondary mt-2">The event you are looking for does not exist or has been removed.</p>
                <Link href="/" className="mt-8 px-6 py-2 bg-text-primary text-vvs-bg font-bold rounded-full">
                    Return Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-vvs-bg text-text-primary py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <Link href="/" className="inline-flex items-center text-sm font-bold text-text-muted hover:text-text-primary mb-8 transition-colors">
                    ← Back to Platform
                </Link>

                <div className="bg-vvs-card border border-text-secondary/10 rounded-2xl overflow-hidden shadow-2xl">
                    {event.bannerUrl && (
                        <div className="w-full h-48 md:h-64 overflow-hidden relative bg-black/20">
                            <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        </div>
                    )}
                    
                    <div className="p-8">
                        <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold font-serif leading-tight mb-2 text-vvs-gold">
                                {event.title}
                            </h1>
                            <div className="flex flex-col gap-1 text-sm text-text-secondary mt-4">
                                <p className="flex items-center gap-2">
                                    <span>📅</span> {new Date(event.eventDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="flex items-center gap-2">
                                    <span>📍</span> {event.location}
                                </p>
                            </div>
                            <p className="mt-6 text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">
                                {event.description}
                            </p>
                        </div>

                        {success ? (
                            <div className="bg-vvs-gold/10 border border-vvs-gold/30 rounded-xl p-6 text-center">
                                <span className="text-4xl block mb-4 text-vvs-gold">✓</span>
                                <h3 className="text-xl font-bold text-vvs-gold mb-2">RSVP Confirmed!</h3>
                                <p className="text-sm text-text-secondary">
                                    Your spot has been reserved. We'll send you an email with further details shortly.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <h3 className="text-lg font-bold border-b border-text-secondary/10 pb-2 mb-4">Reserve Your Spot</h3>
                                
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Full Name</label>
                                    <input 
                                        required 
                                        type="text" 
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-black/20 border border-text-secondary/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-vvs-gold transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Email Address</label>
                                    <input 
                                        required 
                                        type="email" 
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-black/20 border border-text-secondary/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-vvs-gold transition-colors"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Attendance</label>
                                    <select 
                                        value={formData.attendance}
                                        onChange={e => setFormData({ ...formData, attendance: e.target.value })}
                                        className="w-full bg-black/20 border border-text-secondary/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-vvs-gold transition-colors appearance-none"
                                    >
                                        <option value="yes">Yes, I will attend</option>
                                        <option value="no">No, I cannot attend</option>
                                        <option value="maybe">Maybe</option>
                                    </select>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="w-full mt-4 py-4 bg-text-primary text-vvs-bg font-bold rounded-lg hover:bg-vvs-gold transition-colors disabled:opacity-50"
                                >
                                    {submitting ? "Submitting..." : "Submit RSVP"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
