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
            city,
            category,
            portfolioUrl,
            statement,
        } = body;

        if (!name || !name.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
        if (!email || !email.trim()) return NextResponse.json({ error: "Email is required" }, { status: 400 });
        if (!phone || !phone.trim()) return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        if (!gender) return NextResponse.json({ error: "Gender is required" }, { status: 400 });
        if (!city) return NextResponse.json({ error: "City is required" }, { status: 400 });
        if (!category) return NextResponse.json({ error: "Creative category is required" }, { status: 400 });
        if (!statement || !statement.trim()) return NextResponse.json({ error: "Statement of intent is required" }, { status: 400 });

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error } = await supabase.from("future_labs_applications").insert([{
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            gender: gender,
            city: city,
            category: category,
            portfolio_url: portfolioUrl?.trim() || null,
            statement: statement.trim(),
            created_at: new Date().toISOString(),
        }]);

        if (error) {
            console.error("Future Labs application insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Future Labs route error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
