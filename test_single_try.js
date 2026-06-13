import postgres from 'postgres';

const host = "aws-0-eu-west-1.pooler.supabase.com";
const port = 5432;
const user = "postgres.rdoldxaclybdlggayjnc";
const database = "postgres";
const password = "Sk1d061Wh3364?";

async function run() {
    console.log(`Connecting with password: ${password}`);
    const sql = postgres({
        host,
        port,
        user,
        password,
        database,
        ssl: { rejectUnauthorized: false },
        idle_timeout: 1,
        connect_timeout: 4
    });

    try {
        const result = await sql`SELECT 1 as connected`;
        console.log(`🎉 SUCCESS! Connected!`);
        console.log(result);
        await sql.end();
        process.exit(0);
    } catch (err) {
        console.log(`❌ Failed: ${err.message}`);
        await sql.end();
        process.exit(1);
    }
}

run();
