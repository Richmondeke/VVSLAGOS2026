import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
    try {
        const result = await sql`
            SELECT id, name, email, session_id, question, created_at
            FROM public.panel_questions
            ORDER BY created_at DESC
        `;
        
        const questions = result.map((row: any) => ({
            id: row.id,
            name: row.name,
            email: row.email,
            session_id: row.session_id,
            question: row.question,
            created_at: row.created_at
        }));

        return NextResponse.json(questions);
    } catch (err: any) {
        console.error("GET /api/panel-questions error:", err);
        return NextResponse.json([]);
    }
}
