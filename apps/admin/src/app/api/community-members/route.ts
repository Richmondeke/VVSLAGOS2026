import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const search = searchParams.get("search") || "";
        const city = searchParams.get("city") || "";
        const gender = searchParams.get("gender") || "";
        const pageSize = 20;
        const offset = (page - 1) * pageSize;

        // Build type-safe dynamic query clauses using postgres nested sql tags
        const cityQuery = city ? sql`AND city ILIKE ${`%${city}%`}` : sql``;
        const genderQuery = gender ? sql`AND gender = ${gender}` : sql``;
        const searchQuery = search ? sql`AND (name ILIKE ${`%${search}%`} OR email ILIKE ${`%${search}%`})` : sql``;

        // Count query
        const countResult = await sql`
            SELECT count(*)::int as count 
            FROM public.community_members 
            WHERE 1=1 ${cityQuery} ${genderQuery} ${searchQuery}
        `;
        const total = countResult[0]?.count || 0;

        // Select items query
        const itemsResult = await sql`
            SELECT id, name, age, email, occupation, city, gender, interests, selfie_url, created_at
            FROM public.community_members 
            WHERE 1=1 ${cityQuery} ${genderQuery} ${searchQuery}
            ORDER BY created_at DESC
            LIMIT ${pageSize} OFFSET ${offset}
        `;

        // Map column names to frontend expected casing
        const items = itemsResult.map((row: any) => ({
            id: row.id,
            name: row.name,
            age: row.age,
            email: row.email,
            occupation: row.occupation,
            city: row.city,
            gender: row.gender,
            interests: row.interests || [],
            selfie_url: row.selfie_url,
            created_at: row.created_at
        }));

        return NextResponse.json({
            items,
            total,
            page,
            pageSize,
        });
    } catch (err: any) {
        console.error("GET /api/community-members error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
