import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("rsvps")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Supabase RSVP fetch error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (err) {
        console.error("RSVP route error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
