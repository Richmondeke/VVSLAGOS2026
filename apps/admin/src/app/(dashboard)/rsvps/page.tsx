import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "RSVPs | VVS Admin",
};

// Next.js config to disable static rendering since we fetch live data
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RSVPsPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rdoldxaclybdlggayjnc.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkb2xkeGFjbHliZGxnZ2F5am5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNzA4OTgsImV4cCI6MjA5Njg0Njg5OH0.n5hUc0sFDOHHS-1ljPXl93wgt_Bp2Hk3VdFQ3FzCi7o";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: rsvps, error } = await supabase
        .from("rsvps")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-admin-primary">RSVPs</h1>
                    <p className="text-sm text-admin-muted mt-1">
                        Manage requests from the landing page.
                    </p>
                </div>
            </div>

            {error ? (
                <div className="bg-admin-danger/10 border border-admin-danger text-admin-danger p-4 rounded-lg">
                    <p className="font-semibold">Failed to load RSVPs</p>
                    <p className="text-sm">{error.message}</p>
                </div>
            ) : (
                <div className="bg-admin-surface border border-admin-border rounded-xl shadow-[var(--shadow-stripe-ambient)] overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[600px]">
                        <thead className="bg-admin-surface text-admin-muted uppercase text-[10px] tracking-wider border-b border-admin-border">
                            <tr>
                                <th className="px-6 py-4 font-bold">Email</th>
                                <th className="px-6 py-4 font-bold">Name</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold">Referred By</th>
                                <th className="px-6 py-4 font-bold">Date</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                            {!rsvps || rsvps.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-admin-muted">
                                        No RSVPs found.
                                    </td>
                                </tr>
                            ) : (
                                rsvps.map((rsvp: any) => (
                                    <tr key={rsvp.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-admin-primary">
                                            {rsvp.email}
                                        </td>
                                        <td className="px-6 py-4 text-admin-muted">
                                            {rsvp.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-admin-info/10 text-admin-info">
                                                {rsvp.attendance}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-admin-muted">
                                            {rsvp.referred_by_admin ? (
                                                <span className="px-2 py-1 bg-admin-accent/10 text-admin-accent rounded-md text-xs font-medium">
                                                    {rsvp.referred_by_admin}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">Organic</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-admin-muted">
                                            {new Date(rsvp.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-admin-accent hover:text-admin-accent-hover font-semibold transition-colors">
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
