import postgres from 'postgres';

const password = "Sk1d061Wh3364?";
const host = "aws-0-eu-west-1.pooler.supabase.com";
const user = "postgres.rdoldxaclybdlggayjnc";
const database = "postgres";

async function testPort(port, useSsl) {
    const sslQuery = useSsl ? "?sslmode=require" : "";
    const connectionString = `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}${sslQuery}`;
    
    console.log(`Trying port ${port} (SSL: ${useSsl})...`);
    const sql = postgres(connectionString, {
        idle_timeout: 2,
        connect_timeout: 4
    });

    try {
        const result = await sql`SELECT 1 as connected`;
        console.log(`🎉 SUCCESS! Connected on port ${port}!`);
        await sql.end();
        return sql;
    } catch (err) {
        console.log(`❌ Failed: ${err.message}`);
        await sql.end();
        return null;
    }
}

async function run() {
    // Try port 6543 with SSL
    let sql = await testPort(6543, true);
    if (!sql) {
        // Try port 5432 with SSL
        sql = await testPort(5432, true);
    }
    
    if (sql) {
        console.log("Database connection test finished with success!");
    } else {
        console.log("Database connection test failed.");
    }
}

run();
