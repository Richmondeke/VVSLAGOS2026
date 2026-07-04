import postgres from 'postgres';

const passwords = [
    "Rich1996?",
    "Rich1996?!",
    "Sk1d061Wh3364?",
    "Sk1d061Wh3364?1",
    "Sk1d061Wh3364?!",
    "[Rich1996?]",
    "[Rich1996?!]",
    "[Sk1d061Wh3364?]",
    "[Sk1d061Wh3364?1]",
    "[Sk1d061Wh3364?!]",
    "Rich1996",
    "Sk1d061Wh3364"
];

const host = "aws-0-eu-west-1.pooler.supabase.com";
const port = 6543;
const user = "postgres.rdoldxaclybdlggayjnc";
const database = "postgres";

async function testSingle(password, useSsl) {
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
        options.ssl = 'require';
    }
    
    console.log(`Testing with password: ${password} (SSL: ${useSsl})`);
    const sql = postgres(options);

    try {
        const result = await sql`SELECT 1 as connected`;
        console.log(`🎉 SUCCESS! Connected!`);
        console.log(`Working Password: ${password}`);
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
        // Test with SSL first
        let success = await testSingle(password, true);
        if (success) process.exit(0);
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Test without SSL
        success = await testSingle(password, false);
        if (success) process.exit(0);
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    console.log("All connection attempts failed.");
    process.exit(1);
}

runTests();
