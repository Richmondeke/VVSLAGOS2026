import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            name,
            email,
            phone,
            gender,
            occupation,
            company,
            role,
            heard_about,
            attendance,
            events,
            event_type,
            referred_by_admin,
        } = body;

        if (!email || !email.trim()) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error } = await supabase.from("rsvps").insert([{
            name: (name || "").trim() || "Guest",
            email: email.trim().toLowerCase(),
            phone: phone?.trim() || null,
            gender: gender || null,
            occupation: occupation?.trim() || null,
            company: company?.trim() || null,
            role: role?.trim() || null,
            heard_about: heard_about || null,
            attendance: attendance || "yes",
            events: Array.isArray(events) ? events : [],
            referred_by_admin: referred_by_admin || null,
            created_at: new Date().toISOString(),
        }]);

        if (error) {
            console.error("RSVP insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("RSVP route error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
