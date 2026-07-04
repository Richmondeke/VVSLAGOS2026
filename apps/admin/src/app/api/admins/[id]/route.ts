import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
        }

        // Delete from platform.admin_users
        await sql`
            DELETE FROM platform.admin_users
            WHERE id = ${id}
        `;

        return new Response(null, { status: 204 });
    } catch (err: any) {
        console.error("DELETE /api/admins/[id] error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
