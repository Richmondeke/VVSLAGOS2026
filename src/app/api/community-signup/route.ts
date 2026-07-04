import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, age, email, occupation, city, gender, interests, selfie_url } = body;

        if (!name || !email || !age || !occupation || !city || !gender) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Insert community member
        const { data, error } = await supabase
            .from("community_members")
            .insert([{
                name: name.trim(),
                age: parseInt(age),
                email: email.trim(),
                occupation: occupation.trim(),
                city,
                gender,
                interests: interests || [],
                selfie_url: selfie_url || null,
                created_at: new Date().toISOString(),
            }]);

        if (error) {
            console.error("Community member insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 2. Also insert into vvs_auth.users for admin dashboard visibility
        try {
            await supabase.rpc('insert_community_user_v2', {
                user_email: email.trim(),
                pwd_hash: '$2a$10$qYo5vznkHvYI5O9x97.nmehqQeHcLrztiBvD94kBlMc4PPZ/j4Fxi',
                user_phone: null
            });
        } catch (rpcErr) {
            console.error("RPC error:", rpcErr);
        }

        return NextResponse.json({
            success: true
        });
    } catch (err) {
        console.error("Community signup error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
