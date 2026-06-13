import postgres from 'postgres';

const passwords = [
    "Sk1d061Wh33764?",
    "Sk1d061Wh33764?!",
    "Sk1d61Wh33764?",
    "Sk1d61Wh33764?!"
];

const host = "aws-0-eu-west-1.pooler.supabase.com";
const ports = [5432, 6543];
const user = "postgres.rdoldxaclybdlggayjnc";
const database = "postgres";

async function testSingle(password, port, useSsl) {
    const options = {
        host,
        port,
        user,
        password,
        database,
        idle_timeout: 2,
        connect_timeout: 4
    };
    if (useSsl) {
        options.ssl = { rejectUnauthorized: false };
    }
    
    console.log(`Testing with password: "${password}" on port ${port} (SSL: ${useSsl})`);
    const sql = postgres(options);

    try {
        const result = await sql`SELECT 1 as connected`;
        console.log(`🎉 SUCCESS! Connected!`);
        console.log(`Working Password: ${password}`);
        console.log(`Port: ${port}`);
        console.log(`SSL option: ${useSsl}`);
        console.log(result);
        await sql.end();
        return true;
    } catch (err) {
        console.log(`❌ Failed: ${err.message}`);
        await sql.end();
        return false;
    }
}

async function runTests() {
    for (const password of passwords) {
        for (const port of ports) {
            for (const useSsl of [true, false]) {
                const success = await testSingle(password, port, useSsl);
                if (success) {
                    process.exit(0);
                }
                await new Promise((resolve) => setTimeout(resolve, 300));
            }
        }
    }
    console.log("All connection attempts failed.");
    process.exit(1);
}

runTests();
