import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "";
        const pageSize = 20;
        const offset = (page - 1) * pageSize;

        // Build type-safe dynamic query clauses using postgres nested sql tags
        const statusQuery = status ? sql`AND status = ${status}` : sql``;
        const searchQuery = search ? sql`AND (email ILIKE ${`%${search}%`} OR phone ILIKE ${`%${search}%`})` : sql``;

        // Count query
        const countResult = await sql`
            SELECT count(*)::int as count 
            FROM vvs_auth.users 
            WHERE 1=1 ${statusQuery} ${searchQuery}
        `;
        const total = countResult[0]?.count || 0;

        // Select items query
        const itemsResult = await sql`
            SELECT id, email, phone, status, source, created_at
            FROM vvs_auth.users 
            WHERE 1=1 ${statusQuery} ${searchQuery}
            ORDER BY created_at DESC
            LIMIT ${pageSize} OFFSET ${offset}
        `;

        // Map column names to camelCase for frontend
        const items = itemsResult.map((row: any) => ({
            id: row.id,
            email: row.email,
            phone: row.phone,
            status: row.status,
            source: row.source,
            createdAt: row.created_at
        }));

        return NextResponse.json({
            items,
            total,
            page,
            pageSize
        });
    } catch (err: any) {
        console.error("GET /api/members error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
