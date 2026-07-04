import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
    try {
        // Fetch all admins and join with auth users to get email
        const result = await sql`
            SELECT a.id, a.user_id, a.role, a.is_active, u.email, a.created_at
            FROM platform.admin_users a
            LEFT JOIN vvs_auth.users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
        `;

        const admins = result.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            role: row.role,
            isActive: row.is_active,
            email: row.email || "Unknown Email",
            createdAt: row.created_at
        }));

        return NextResponse.json(admins);
    } catch (err: any) {
        console.error("GET /api/admins error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId, role } = await request.json();
        if (!userId || !role) {
            return NextResponse.json({ error: "Missing userId or role" }, { status: 400 });
        }

        let targetUserId = userId.trim();

        // Resolve email to user ID
        if (targetUserId.includes("@")) {
            const userResult = await sql`
                SELECT id 
                FROM vvs_auth.users 
                WHERE email = ${targetUserId.toLowerCase()}
                LIMIT 1
            `;
            if (userResult.length === 0) {
                return NextResponse.json(
                    { error: "No registered user found with that email address. Only existing registered users can be made admins." },
                    { status: 404 }
                );
            }
            targetUserId = userResult[0].id;
        }

        // Insert into platform.admin_users
        const insertResult = await sql`
            INSERT INTO platform.admin_users (user_id, role, is_active)
            VALUES (${targetUserId}, ${role}, true)
            ON CONFLICT (user_id) DO UPDATE SET role = ${role}, is_active = true
            RETURNING id, user_id, role, is_active, created_at
        `;

        const newAdmin = {
            id: insertResult[0].id,
            userId: insertResult[0].user_id,
            role: insertResult[0].role,
            isActive: insertResult[0].is_active,
            createdAt: insertResult[0].created_at
        };

        return NextResponse.json(newAdmin, { status: 201 });
    } catch (err: any) {
        console.error("POST /api/admins error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
