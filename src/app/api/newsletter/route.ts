import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email || !email.trim()) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Save newsletter subscribers to the rsvps table so Admin sees them in one dashboard
        const { error } = await supabase.from("rsvps").insert([{
            name: "Newsletter Subscriber",
            email: email.trim().toLowerCase(),
            attendance: "yes",
            events: [],
            heard_about: "newsletter_signup",
            created_at: new Date().toISOString(),
        }]);

        if (error) {
            // If duplicate email, that's fine — they're already subscribed
            if (error.code === "23505") {
                return NextResponse.json({ success: true, message: "Already subscribed" });
            }
            console.error("Newsletter insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Newsletter route error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
