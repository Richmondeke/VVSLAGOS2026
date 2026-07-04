import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
    try {
        const result = await sql`
            SELECT id, name, email, phone, gender, city, category, portfolio_url, statement, created_at
            FROM public.future_labs_applications
            ORDER BY created_at DESC
        `;

        const applications = result.map((row: any) => ({
            id: row.id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            gender: row.gender,
            city: row.city,
            category: row.category,
            portfolio_url: row.portfolio_url,
            statement: row.statement,
            created_at: row.created_at
        }));

        return NextResponse.json(applications);
    } catch (err: any) {
        console.error("GET /api/future-labs error:", err);
        return NextResponse.json([]);
    }
}
