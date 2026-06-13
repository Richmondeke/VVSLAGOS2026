import postgres from 'postgres';

const host = "aws-0-eu-west-1.pooler.supabase.com";
const port = 5432; // port 5432 session pooler
const user = "postgres.rdoldxaclybdlggayjnc";
const database = "postgres";

const candidates = [
    "Sk1d061Wh33764?",
    "Sk1d061Wh33764?!"
];

async function testSingle(password) {
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
        await sql.end();
        return { success: true, result };
    } catch (err) {
        await sql.end();
        return { success: false, message: err.message };
    }
}

async function runLoop() {
    console.log(`Starting recovery test loop on PORT 5432 for candidates.`);
    
    for (let i = 1; i <= 6; i++) {
        console.log(`\n[Attempt ${i}/6] testing...`);
        for (const pwd of candidates) {
            const res = await testSingle(pwd);
            if (res.success) {
                console.log(`\n🎉 SUCCESS! Connected to Supabase on PORT 5432!`);
                console.log(`Working Password: ${pwd}`);
                console.log(res.result);
                process.exit(0);
            } else {
                console.log(`Password: ${pwd} -> Result: ${res.message}`);
                if (!res.message.includes('ECIRCUITBREAKER') && !res.message.includes('CONNECT_TIMEOUT')) {
                    // Password failed with real credential error, but wait, we want to try all
                }
            }
        }
        console.log(`Waiting 15 seconds for next iteration...`);
        await new Promise((resolve) => setTimeout(resolve, 15000));
    }
    console.log("All attempts completed.");
    process.exit(1);
}

runLoop();
