import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
    try {
        const result = await sql`
            SELECT id, email, category, nominee, created_at
            FROM public.award_votes
            ORDER BY created_at DESC
        `;
        
        const votes = result.map((row: any) => ({
            id: row.id,
            email: row.email,
            category: row.category,
            nominee: row.nominee,
            created_at: row.created_at
        }));

        return NextResponse.json(votes);
    } catch (err: any) {
        console.error("GET /api/votes error:", err);
        return NextResponse.json([]);
    }
}
