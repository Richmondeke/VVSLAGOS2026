import postgres from 'postgres';

const connStr = "postgresql://postgres.rdoldxaclybdlggayjnc:Sk1d61Wh33764%3F@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require";

async function run() {
    const sql = postgres(connStr);
    try {
        console.log("Dropping conflicting rsvps table and drizzle schema...");
        await sql`DROP TABLE IF EXISTS "rsvps" CASCADE;`;
        await sql`DROP SCHEMA IF EXISTS "drizzle" CASCADE;`;
        console.log("Dropped!");
        
        const tables = await sql`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
            ORDER BY table_schema, table_name;
        `;
        console.log("Current tables in database:");
        console.table(tables);
        await sql.end();
    } catch (err) {
        console.error("Error:", err);
        await sql.end();
    }
}

run();
