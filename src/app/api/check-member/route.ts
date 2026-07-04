import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, serviceKey);
        const { data, error } = await supabase
            .from("community_members")
            .select("name, selfie_url")
            .eq("email", email.trim().toLowerCase())
            .order("created_at", { ascending: false })
            .limit(1);

        if (error) {
            console.error("Check member error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const member = data && data.length > 0 ? data[0] : null;

        return NextResponse.json({
            exists: !!member,
            member: member ? { name: member.name, selfie_url: member.selfie_url } : null
        });
    } catch (err: any) {
        console.error("Check member server error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
