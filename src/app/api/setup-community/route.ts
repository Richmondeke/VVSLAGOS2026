import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// One-shot endpoint to create community_members table
// Call via: POST /api/setup-community with body { "secret": "vvs-setup-2026" }
export async function POST(req: Request) {
    try {
        const body = await req.json();
        if (body.secret !== "vvs-setup-2026") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, serviceKey);

        // Try to query the table — if it fails, we know we need to create it
        const { error: checkError } = await supabase
            .from("community_members")
            .select("id")
            .limit(1);

        if (!checkError) {
            return NextResponse.json({ message: "Table already exists", status: "ok" });
        }

        // Table doesn't exist — return instructions for manual creation
        return NextResponse.json({
            message: "Table needs to be created manually in Supabase dashboard",
            sql: `
CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    email TEXT NOT NULL,
    occupation TEXT NOT NULL,
    city TEXT NOT NULL,
    gender TEXT NOT NULL,
    interests TEXT[] DEFAULT '{}',
    selfie_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public inserts" ON public.community_members FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public reads" ON public.community_members FOR SELECT TO anon USING (true);
            `.trim(),
            supabase_dashboard: "https://supabase.com/dashboard/project/rdoldxaclybdlggayjnc/editor",
            status: "needs_setup"
        });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
