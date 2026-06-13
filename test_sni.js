import postgres from 'postgres';

const password = "Sk1d061Wh33764?!";
const host = "aws-0-eu-west-1.pooler.supabase.com";
const port = 6543;
const user = "postgres.rdoldxaclybdlggayjnc";
const database = "postgres";

async function testSingle() {
    const sql = postgres({
        host,
        port,
        user,
        password,
        database,
        ssl: {
            rejectUnauthorized: false
        },
        idle_timeout: 1,
        connect_timeout: 3
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

async function runRetryLoop() {
    console.log(`Starting retry loop for password verification: ${password}`);
    for (let i = 1; i <= 6; i++) {
        console.log(`[Attempt ${i}/6] Connecting...`);
        const res = await testSingle();
        if (res.success) {
            console.log(`\n🎉 SUCCESS! Connected to Supabase!`);
            console.log(`Password: ${password}`);
            console.log(res.result);
            process.exit(0);
        } else {
            console.log(`❌ Failed: ${res.message}`);
            if (!res.message.includes('ECIRCUITBREAKER')) {
                // If it is not a circuit breaker block, but a real auth failure, the password is wrong!
                console.log(`Stopping loop: password is incorrect (non-circuit breaker failure).`);
                process.exit(1);
            }
        }
        await new Promise((resolve) => setTimeout(resolve, 8000));
    }
    console.log("Retry loop finished. Still blocked or failed.");
    process.exit(1);
}

runRetryLoop();
